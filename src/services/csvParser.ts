/**
 * Parse CSV text into devotional row objects.
 *
 * Expected columns:
 *   date, scripture_ref, scripture_text, reflection, prayer_prompt, questions
 *
 * - Questions are separated by | within the questions column
 * - Fields may be quoted with double quotes (handles commas inside quotes)
 * - First row is treated as header if it starts with "date"
 */

export interface ParsedDevotional {
  date: string;        // YYYY-MM-DD
  scriptureRef: string;
  scriptureText: string;
  reflection: string;
  prayerPrompt: string;
  questions: string[];
}

export interface ParseResult {
  row: number;
  data: ParsedDevotional | null;
  status: 'ok' | 'warning' | 'error';
  message?: string;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

function isValidDate(dateStr: string): boolean {
  const match = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) return false;
  const d = new Date(dateStr + 'T12:00:00');
  return !isNaN(d.getTime());
}

export function parseCSV(text: string): ParseResult[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return [{ row: 0, data: null, status: 'error', message: 'No data found' }];
  }

  // Skip header row if present
  let startIndex = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.startsWith('date') || firstLine.includes('scripture_ref')) {
    startIndex = 1;
  }

  const results: ParseResult[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const rowNum = i + 1;
    try {
      const fields = parseCSVLine(lines[i]);

      if (fields.length < 5) {
        results.push({
          row: rowNum,
          data: null,
          status: 'error',
          message: `Expected at least 5 columns, found ${fields.length}`,
        });
        continue;
      }

      const [date, scriptureRef, scriptureText, reflection, prayerPrompt, questionsRaw] = fields;

      // Validate date
      if (!isValidDate(date)) {
        results.push({
          row: rowNum,
          data: null,
          status: 'error',
          message: `Invalid date format "${date}" (expected YYYY-MM-DD)`,
        });
        continue;
      }

      // Parse questions
      const questions = questionsRaw
        ? questionsRaw.split('|').map((q) => q.trim()).filter((q) => q.length > 0)
        : [];

      const data: ParsedDevotional = {
        date,
        scriptureRef,
        scriptureText,
        reflection,
        prayerPrompt,
        questions,
      };

      // Validate required fields
      const warnings: string[] = [];
      if (!scriptureRef) warnings.push('missing scripture reference');
      if (!scriptureText) warnings.push('missing scripture text');
      if (!reflection) warnings.push('missing reflection');
      if (!prayerPrompt) warnings.push('missing prayer prompt');
      if (questions.length === 0) warnings.push('no questions');

      if (warnings.length > 0 && (!scriptureRef || !scriptureText || !reflection)) {
        results.push({
          row: rowNum,
          data,
          status: 'error',
          message: `Missing required fields: ${warnings.join(', ')}`,
        });
      } else if (warnings.length > 0) {
        results.push({
          row: rowNum,
          data,
          status: 'warning',
          message: warnings.join(', '),
        });
      } else {
        results.push({ row: rowNum, data, status: 'ok' });
      }
    } catch (e: any) {
      results.push({
        row: rowNum,
        data: null,
        status: 'error',
        message: e.message || 'Parse error',
      });
    }
  }

  return results;
}

export function generateTemplateCSV(): string {
  const header = 'date,scripture_ref,scripture_text,reflection,prayer_prompt,questions';
  const example1 = '2026-02-12,John 3:16-17,"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.","Today we reflect on the depth of God\'s love for us. This verse reminds us that salvation is a gift freely given.","Lord, help us to grasp the depth of your love and share it with others.","What does God\'s love mean to you personally?|How can you share God\'s love with someone today?"';
  const example2 = '2026-02-13,Psalm 23:1-6,"The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.","David reminds us that God is our provider and protector. Even in the darkest valleys, we are not alone.","Shepherd us today Lord. Lead us to still waters and restore our souls.","Where in your life do you need God\'s provision?|How have you experienced God as your shepherd?"';

  return [header, example1, example2].join('\n');
}
