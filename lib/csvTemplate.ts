import Papa from 'papaparse';
import { supabase } from './supabase';
import { validateDevotional, estimateReadTime } from './devotionalValidation';
import type { DevotionalStatus } from '../types';

export const CSV_COLUMNS = [
  'title',
  'scripture',
  'scripture_text',
  'body',
  'reflect_question_1',
  'reflect_question_2',
  'reflect_question_3',
  'reflect_question_4',
  'reflect_question_5',
  'prayer',
  'date',
  'author_name',
  'status',
  'scheduled_date',
] as const;

export interface ParsedDevotionalRow {
  title: string;
  scripture: string;
  scripture_text: string;
  body: string;
  reflect_questions: string[];
  prayer: string;
  date: string;
  author_name: string;
  status: DevotionalStatus;
  scheduled_date: string | null;
}

export interface ParsedRow {
  rowNumber: number;
  data: ParsedDevotionalRow;
  errors: string[];
  isDuplicateDate: boolean;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: string[];
}

const EXAMPLE_ROWS = [
  {
    title: 'The Good Shepherd',
    scripture: 'John 10:11-15',
    scripture_text: 'I am the good shepherd. The good shepherd lays down his life for the sheep.',
    body: 'Jesus calls himself the good shepherd — not a hired hand who runs when danger comes, but the one who stays. His love is not passive; it is sacrificial and intentional.',
    reflect_question_1: 'What does it mean to you that Jesus calls himself your shepherd?',
    reflect_question_2: 'In what area of your life do you need to trust the Shepherd more?',
    reflect_question_3: '',
    reflect_question_4: '',
    reflect_question_5: '',
    prayer: 'Lord, thank you for being my good shepherd. Help me trust your voice and follow where you lead. Amen.',
    date: '2026-03-01',
    author_name: 'Pastor James',
    status: 'draft',
    scheduled_date: '',
  },
  {
    title: 'Living Water',
    scripture: 'John 4:13-14',
    scripture_text: 'Everyone who drinks this water will be thirsty again, but whoever drinks the water I give them will never thirst.',
    body: 'The woman at the well was searching for satisfaction in all the wrong places. Jesus met her where she was and offered something the world never could — living water that satisfies the deepest thirst of the soul.',
    reflect_question_1: 'What "wells" have you been drinking from that leave you thirsty?',
    reflect_question_2: 'How can you drink more deeply from the living water Jesus offers?',
    reflect_question_3: '',
    reflect_question_4: '',
    reflect_question_5: '',
    prayer: 'Jesus, you are the living water. Fill me afresh today. Help me find my satisfaction in you alone. Amen.',
    date: '2026-03-02',
    author_name: 'Pastor James',
    status: 'draft',
    scheduled_date: '',
  },
];

export const generateTemplateCSV = (): string => {
  return Papa.unparse({
    fields: [...CSV_COLUMNS],
    data: EXAMPLE_ROWS.map((row) => CSV_COLUMNS.map((col) => row[col as keyof typeof row] ?? '')),
  });
};

const VALID_STATUSES: DevotionalStatus[] = ['draft', 'scheduled', 'published', 'archived'];

export const parseDevotionalCSV = (csvString: string): ParseResult => {
  const globalErrors: string[] = [];

  const parsed = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  if (parsed.errors.length > 0) {
    const critical = parsed.errors.filter((e) => e.type === 'Delimiter' || e.type === 'FieldMismatch');
    if (critical.length > 0) {
      globalErrors.push(`CSV parsing error: ${critical[0].message}`);
    }
  }

  if (!parsed.data || parsed.data.length === 0) {
    globalErrors.push('CSV file is empty or has no data rows');
    return { rows: [], errors: globalErrors };
  }

  // Check required columns exist
  const headers = parsed.meta.fields?.map((f) => f.toLowerCase()) ?? [];
  const requiredCols = ['title', 'scripture', 'scripture_text', 'body', 'prayer', 'date', 'reflect_question_1'];
  const missing = requiredCols.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    globalErrors.push(`Missing required columns: ${missing.join(', ')}`);
    return { rows: [], errors: globalErrors };
  }

  const dateSeen = new Map<string, number>();
  const rows: ParsedRow[] = parsed.data.map((rawRow, index) => {
    const get = (key: string) => (rawRow[key] ?? '').trim();

    const reflectQuestions = [
      get('reflect_question_1'),
      get('reflect_question_2'),
      get('reflect_question_3'),
      get('reflect_question_4'),
      get('reflect_question_5'),
    ].filter((q) => q.length > 0);

    const rawStatus = get('status').toLowerCase();
    const status: DevotionalStatus = VALID_STATUSES.includes(rawStatus as DevotionalStatus)
      ? (rawStatus as DevotionalStatus)
      : 'draft';

    const data: ParsedDevotionalRow = {
      title: get('title'),
      scripture: get('scripture'),
      scripture_text: get('scripture_text'),
      body: get('body'),
      reflect_questions: reflectQuestions,
      prayer: get('prayer'),
      date: get('date'),
      author_name: get('author_name'),
      status,
      scheduled_date: get('scheduled_date') || null,
    };

    const errors = validateDevotional(data);
    if (rawStatus && !VALID_STATUSES.includes(rawStatus as DevotionalStatus)) {
      errors.push(`Invalid status "${rawStatus}" — defaulting to draft`);
    }

    const dateKey = data.date;
    const isDuplicateDate = dateSeen.has(dateKey);
    dateSeen.set(dateKey, (dateSeen.get(dateKey) ?? 0) + 1);

    return {
      rowNumber: index + 1,
      data,
      errors,
      isDuplicateDate,
    };
  });

  // Mark earlier occurrence of duplicate dates
  const dupDates = new Set<string>();
  for (const row of rows) {
    if (row.isDuplicateDate) dupDates.add(row.data.date);
  }
  for (const row of rows) {
    if (dupDates.has(row.data.date)) row.isDuplicateDate = true;
  }

  return { rows, errors: globalErrors };
};

const BATCH_SIZE = 25;

export const batchInsertDevotionals = async (
  rows: ParsedDevotionalRow[],
  userId: string,
  churchId: string | null,
  authorName: string,
  onProgress: (completed: number, total: number) => void,
): Promise<{ inserted: number; errors: string[] }> => {
  let inserted = 0;
  const errors: string[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const payload = batch.map((row) => ({
      title: row.title.trim(),
      scripture: row.scripture.trim(),
      scripture_text: row.scripture_text.trim(),
      body: row.body.trim(),
      reflect_questions: row.reflect_questions,
      prayer: row.prayer.trim(),
      date: row.date,
      read_time_minutes: estimateReadTime(row.body),
      author_name: row.author_name.trim() || authorName,
      author_id: userId,
      church_id: churchId,
      status: row.status,
      scheduled_date: row.status === 'scheduled' && row.scheduled_date ? row.scheduled_date : null,
      created_at: now,
      updated_at: now,
    }));

    const { error } = await supabase.from('devotionals').insert(payload);
    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
    onProgress(inserted, rows.length);
  }

  return { inserted, errors };
};
