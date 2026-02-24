import { useEffect } from 'react';
import { router } from 'expo-router';
import { useOnboarding } from '../lib/OnboardingContext';

export const useRequireRole = (minimumRole: 'author' | 'admin') => {
  const { role, isLoading } = useOnboarding();

  useEffect(() => {
    if (isLoading) return;
    const allowed =
      minimumRole === 'author'
        ? role === 'author' || role === 'admin'
        : role === 'admin';
    if (!allowed) {
      router.replace('/');
    }
  }, [role, isLoading, minimumRole]);

  return { isLoading, role };
};
