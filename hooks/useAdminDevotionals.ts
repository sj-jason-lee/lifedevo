import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useOnboarding } from '../lib/OnboardingContext';
import type { DevotionalRow, DevotionalStatus } from '../types';

export const useAdminDevotionals = (churchId?: string | null) => {
  const { user } = useAuth();
  const { role } = useOnboarding();
  const [devotionals, setDevotionals] = useState<DevotionalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DevotionalStatus | 'all'>('all');

  const fetchDevotionals = useCallback(async () => {
    if (!user) return;

    // undefined = still loading church, stay in loading state
    if (churchId === undefined) return;

    // null = no church, return empty immediately
    if (churchId === null) {
      setDevotionals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let query = supabase
      .from('devotionals')
      .select('*')
      .eq('church_id', churchId)
      .order('updated_at', { ascending: false });

    // Authors see only their own; admins see all
    if (role !== 'admin') {
      query = query.eq('author_id', user.id);
    }

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setDevotionals((data ?? []) as DevotionalRow[]);
    }
    setIsLoading(false);
  }, [user, role, filter, churchId]);

  useEffect(() => {
    fetchDevotionals();
  }, [fetchDevotionals]);

  const deleteDevotional = useCallback(
    (id: string) => {
      Alert.alert(
        'Delete Devotional',
        'This action cannot be undone. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const { error: deleteError } = await supabase.from('devotionals').delete().eq('id', id);
              if (deleteError) {
                Alert.alert('Error', `Failed to delete: ${deleteError.message}`);
              } else {
                fetchDevotionals();
              }
            },
          },
        ]
      );
    },
    [fetchDevotionals]
  );

  const updateStatus = useCallback(
    async (id: string, status: DevotionalStatus) => {
      const { error: updateError } = await supabase
        .from('devotionals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (updateError) {
        Alert.alert('Error', `Failed to update status: ${updateError.message}`);
      } else {
        fetchDevotionals();
      }
    },
    [fetchDevotionals]
  );

  return {
    devotionals,
    isLoading,
    error,
    filter,
    setFilter,
    refetch: fetchDevotionals,
    deleteDevotional,
    updateStatus,
  };
};
