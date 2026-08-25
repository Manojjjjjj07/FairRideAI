'use client';

/**
 * FairRideAI — Auth helpers
 * useAuth() hook reads the stored user from localStorage.
 * Use redirectIfUnauth() in page components to guard protected routes.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getStoredUser,
  clearToken,
  type UserResponse,
} from '@/lib/api';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace('/login');
    } else {
      setUser(stored);
      setLoading(false);
    }
  }, [router]);

  function logout() {
    clearToken();
    router.replace('/login');
  }

  return { user, loading, logout };
}

/** Call in pages that should NOT be accessible when already logged in (login, register). */
export function useRedirectIfAuth() {
  const router = useRouter();
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) router.replace('/dashboard');
  }, [router]);
}
