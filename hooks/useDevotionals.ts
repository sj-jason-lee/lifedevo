import { useState, useEffect, useCallback } from 'react';
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

export const useDevotionals = (churchId?: string | null) => {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevotionals = useCallback(async () => {
    // undefined = still loading church, stay in loading state
    if (churchId === undefined) return;

    // null = no church, return empty immediately
    if (churchId === null) {
      setDevotionals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const { data, error: err } = await supabase
      .from('devotionals')
      .select('*')
      .eq('status', 'published')
      .eq('church_id', churchId)
      .lte('date', today)
      .order('date', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setDevotionals((data ?? []).map(mapRow));
      setError(null);
    }
    setIsLoading(false);
  }, [churchId]);

  useEffect(() => {
    fetchDevotionals();
  }, [fetchDevotionals]);

  const todayDevotional = devotionals.length > 0 ? devotionals[0] : null;
  const recentDevotionals = devotionals.slice(1);

  const getById = useCallback(
    (id: string): Devotional | undefined => devotionals.find((d) => d.id === id),
    [devotionals]
  );

  return {
    devotionals,
    todayDevotional,
    recentDevotionals,
    getById,
    isLoading,
    error,
    refetch: fetchDevotionals,
  };
};
