import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import { useOnboarding } from './OnboardingContext';
import type { Church, ChurchMember, ChurchRole } from '../types';
import { logger } from './logger';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateInviteCode = (): string => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
};

const deriveInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface ChurchContextValue {
  church: Church | null;
  members: ChurchMember[];
  memberCount: number;
  isLeader: boolean;
  isLoading: boolean;
  createChurch: (name: string, description: string) => Promise<{ error: string | null }>;
  joinChurch: (inviteCode: string) => Promise<{ error: string | null }>;
  leaveChurch: () => Promise<{ error: string | null }>;
  removeMember: (userId: string) => Promise<{ error: string | null }>;
  updateChurch: (name: string, description: string) => Promise<{ error: string | null }>;
  updateMemberRole: (userId: string, newRole: ChurchRole) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

const ChurchContext = createContext<ChurchContextValue | null>(null);

export const useChurch = (): ChurchContextValue => {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error('useChurch must be used within ChurchProvider');
  return ctx;
};

export const ChurchProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { churchCode: currentChurchCode, setChurchCode } = useOnboarding();
  const [church, setChurch] = useState<Church | null>(null);
  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronous reset when user changes — prevents stale-state flash.
  // React detects setState during render and re-renders before painting.
  const [prevUserId, setPrevUserId] = useState<string | undefined>(user?.id);
  if (prevUserId !== user?.id) {
    logger.debug('[ChurchContext] User changed:', prevUserId, '->', user?.id, '— resetting state');
    setPrevUserId(user?.id);
    setIsLoading(true);
    setChurch(null);
    setMembers([]);
    setIsLeader(false);
  }

  const loadChurch = useCallback(async () => {
    logger.debug('[ChurchContext] loadChurch called, user:', user?.id, 'authLoading:', authLoading);

    if (!user) {
      logger.debug('[ChurchContext] No user, clearing state');
      setChurch(null);
      setMembers([]);
      setIsLeader(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Find the user's church membership
      const { data: membership, error: memberError } = await supabase
        .from('church_members')
        .select('church_id, church_role')
        .eq('user_id', user.id)
        .maybeSingle();

      logger.debug('[ChurchContext] membership query result:', JSON.stringify({ membership, memberError }));

      if (memberError || !membership) {
        logger.debug('[ChurchContext] No membership found — user has no church. memberError:', memberError?.message ?? 'none');
        setChurch(null);
        setMembers([]);
        setIsLeader(false);
        setIsLoading(false);
        return;
      }

      setIsLeader(membership.church_role === 'leader');

      // Fetch the church
      const { data: churchData, error: churchError } = await supabase
        .from('churches')
        .select('*')
        .eq('id', membership.church_id)
        .single();

      logger.debug('[ChurchContext] church query result:', JSON.stringify({ churchData: churchData?.id, churchError }));

      if (churchError || !churchData) {
        logger.debug('[ChurchContext] Church fetch failed:', churchError?.message ?? 'no data');
        setChurch(null);
        setMembers([]);
        setIsLoading(false);
        return;
      }

      setChurch({
        id: churchData.id,
        name: churchData.name,
        description: churchData.description ?? '',
        inviteCode: churchData.invite_code,
        createdBy: churchData.created_by,
        createdAt: churchData.created_at,
      });

      // Fetch members (no join — church_members has no FK to profiles)
      const { data: memberRows, error: membersError } = await supabase
        .from('church_members')
        .select('id, church_id, user_id, church_role, joined_at')
        .eq('church_id', membership.church_id)
        .order('joined_at', { ascending: true });

      logger.debug('[ChurchContext] members query:', JSON.stringify({ count: memberRows?.length, membersError: membersError?.message ?? null }));

      if (memberRows && memberRows.length > 0) {
        // Fetch profiles separately for all member user_ids
        const userIds = memberRows.map((r: any) => r.user_id);
        const { data: profileRows, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_name')
          .in('id', userIds);

        logger.debug('[ChurchContext] profiles query:', JSON.stringify({
          profiles: profileRows?.map(p => ({ id: p.id.slice(0, 8), name: p.user_name })),
          profilesError: profilesError?.message ?? null,
        }));

        const profileMap = new Map<string, string>();
        if (profileRows) {
          for (const p of profileRows) {
            profileMap.set(p.id, p.user_name || 'Unknown');
          }
        }

        const mapped: ChurchMember[] = memberRows.map((row: any) => {
          const name = profileMap.get(row.user_id) || 'Unknown';
          return {
            id: row.id,
            churchId: row.church_id,
            userId: row.user_id,
            churchRole: row.church_role as ChurchRole,
            joinedAt: row.joined_at,
            userName: name,
            initials: deriveInitials(name),
          };
        });
        logger.debug('[ChurchContext] setMembers:', mapped.length, 'members');
        setMembers(mapped);
      } else {
        setMembers([]);
      }
    } catch (e) {
      logger.warn('[ChurchContext] loadChurch exception:', e);
    } finally {
      logger.debug('[ChurchContext] loadChurch complete, setting isLoading=false');
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    logger.debug('[ChurchContext] useEffect triggered — authLoading:', authLoading, 'user:', user?.id);
    if (authLoading) return;
    loadChurch();
  }, [loadChurch, authLoading]);

  // Reconcile profiles.church_code if it drifted from the canonical source
  useEffect(() => {
    if (church && church.inviteCode && church.inviteCode !== currentChurchCode) {
      logger.debug('[ChurchContext] Reconciling church_code:', currentChurchCode, '->', church.inviteCode);
      setChurchCode(church.inviteCode);
    }
  }, [church?.inviteCode, currentChurchCode, setChurchCode]);

  const createChurch = useCallback(
    async (name: string, description: string): Promise<{ error: string | null }> => {
      if (!user) return { error: 'Not authenticated' };

      // Try up to 3 times for unique invite code
      for (let attempt = 0; attempt < 3; attempt++) {
        const code = generateInviteCode();

        const { data: newChurch, error: insertError } = await supabase
          .from('churches')
          .insert({
            name: name.trim(),
            description: description.trim(),
            invite_code: code,
            created_by: user.id,
          })
          .select()
          .single();

        if (insertError) {
          // Unique constraint violation on invite_code — retry
          if (insertError.code === '23505') continue;
          return { error: insertError.message };
        }

        // Insert creator as leader
        const { error: memberError } = await supabase
          .from('church_members')
          .insert({
            church_id: newChurch.id,
            user_id: user.id,
            church_role: 'leader',
          });

        if (memberError) return { error: memberError.message };

        // Sync profiles.church_code
        setChurchCode(code);

        await loadChurch();
        return { error: null };
      }

      return { error: 'Failed to generate unique invite code. Please try again.' };
    },
    [user, setChurchCode, loadChurch]
  );

  const joinChurch = useCallback(
    async (inviteCode: string): Promise<{ error: string | null }> => {
      if (!user) return { error: 'Not authenticated' };

      const code = inviteCode.trim().toUpperCase();

      // Look up church by invite code
      const { data: target, error: lookupError } = await supabase
        .from('churches')
        .select('id, invite_code')
        .eq('invite_code', code)
        .maybeSingle();

      if (lookupError) return { error: lookupError.message };
      if (!target) return { error: 'No church found with that invite code.' };

      // Insert membership
      const { error: joinError } = await supabase
        .from('church_members')
        .insert({
          church_id: target.id,
          user_id: user.id,
          church_role: 'member',
        });

      if (joinError) {
        if (joinError.code === '23505') return { error: 'You are already a member of this church.' };
        return { error: joinError.message };
      }

      // Sync profiles.church_code
      setChurchCode(target.invite_code);

      await loadChurch();
      return { error: null };
    },
    [user, setChurchCode, loadChurch]
  );

  const leaveChurch = useCallback(async (): Promise<{ error: string | null }> => {
    if (!user || !church) return { error: 'No church to leave' };

    const { error } = await supabase
      .from('church_members')
      .delete()
      .eq('church_id', church.id)
      .eq('user_id', user.id);

    if (error) return { error: error.message };

    // Clear profiles.church_code
    setChurchCode('');

    setChurch(null);
    setMembers([]);
    setIsLeader(false);
    return { error: null };
  }, [user, church, setChurchCode]);

  const removeMember = useCallback(
    async (userId: string): Promise<{ error: string | null }> => {
      if (!church) return { error: 'No church' };

      const { error } = await supabase
        .from('church_members')
        .delete()
        .eq('church_id', church.id)
        .eq('user_id', userId);

      if (error) return { error: error.message };

      // Update the target user's profiles.church_code
      await supabase
        .from('profiles')
        .update({ church_code: '', updated_at: new Date().toISOString() })
        .eq('id', userId);

      // Refresh local state
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      return { error: null };
    },
    [church]
  );

  const updateChurch = useCallback(
    async (name: string, description: string): Promise<{ error: string | null }> => {
      if (!church) return { error: 'No church' };

      const { error } = await supabase
        .from('churches')
        .update({
          name: name.trim(),
          description: description.trim(),
        })
        .eq('id', church.id);

      if (error) return { error: error.message };

      setChurch((prev) =>
        prev ? { ...prev, name: name.trim(), description: description.trim() } : prev
      );
      return { error: null };
    },
    [church]
  );

  const updateMemberRole = useCallback(
    async (userId: string, newRole: ChurchRole): Promise<{ error: string | null }> => {
      if (!church) return { error: 'No church' };

      const { error } = await supabase
        .from('church_members')
        .update({ church_role: newRole })
        .eq('church_id', church.id)
        .eq('user_id', userId);

      if (error) return { error: error.message };

      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, churchRole: newRole } : m))
      );
      return { error: null };
    },
    [church]
  );

  const value: ChurchContextValue = {
    church,
    members,
    memberCount: members.length,
    isLeader,
    isLoading,
    createChurch,
    joinChurch,
    leaveChurch,
    removeMember,
    updateChurch,
    updateMemberRole,
    refresh: loadChurch,
  };

  return (
    <ChurchContext.Provider value={value}>
      {children}
    </ChurchContext.Provider>
  );
};
