import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Devotional, DevotionalRow } from '../types';

const mapRow = (row: DevotionalRow): Devotional => ({
  id: row.id,
  title: row.title,
  scripture: row.scripture,
  scriptureText: row.scripture_text,
  body: row.body,
  reflectQuestions: row.reflect_questions,
  prayer: row.prayer,
  date: row.date,
  readTimeMinutes: row.read_time_minutes,
  author: row.author_name,
  churchId: row.church_id,
});

export const useDevotional = (id: string | undefined) => {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    supabase
      .from('devotionals')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setDevotional(mapRow(data as DevotionalRow));
        setIsLoading(false);
      });
  }, [id]);

  return { devotional, isLoading };
};
