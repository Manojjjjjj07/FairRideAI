'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authLogin, getMe, setToken, setStoredUser, ApiError } from '@/lib/api';
import { useRedirectIfAuth } from '@/lib/auth';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const S = {
  bg:          '#000000',
  surface:     'rgba(255,255,255,0.04)',
  border:      'rgba(255,255,255,0.08)',
  textPrimary: '#f5f5f7',
  textSecond:  '#86868b',
  textTert:    '#515154',
};

export default function LoginPage() {
  const router = useRouter();
  useRedirectIfAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');

    try {
      const { access_token } = await authLogin({ email, password });
      setToken(access_token);
      const me = await getMe();
      setStoredUser(me);
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to connect to server. Is the backend running?');
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16 relative"
      style={{ backgroundColor: S.bg }}
    >
      {/* Back button — ghost pill matching nav style */}
      <Link
        href="/"
        className="fixed top-5 left-5 inline-flex items-center gap-2 font-medium rounded-full transition-all hover:opacity-70"
        style={{
          fontSize: 13,
          color: S.textSecond,
          background: S.surface,
          border: `1px solid ${S.border}`,
          padding: '8px 16px',
        }}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} />
        Back
      </Link>

      <div className="w-full relative z-10" style={{ maxWidth: 380 }}>

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: S.surface, border: `1px solid ${S.border}` }}
          >
            <Shield style={{ width: 20, height: 20, color: S.textPrimary }} />
          </div>
          <h1
            className="font-bold tracking-tight"
            style={{ fontSize: 26, color: S.textPrimary, letterSpacing: '-0.015em' }}
          >
            Welcome back
          </h1>
          <p className="mt-1.5" style={{ fontSize: 13, color: S.textSecond }}>
            Sign in to manage your protection cases
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl"
          style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '28px' }}
        >
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 12, fontWeight: 500, color: S.textSecond }}>
                Email address
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail style={{ width: 15, height: 15, color: S.textTert }} />}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label style={{ fontSize: 12, fontWeight: 500, color: S.textSecond }}>
                  Password
                </label>
                <Link
                  href="#"
                  className="transition-colors hover:opacity-70"
                  style={{ fontSize: 12, color: S.textSecond }}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock style={{ width: 15, height: 15, color: S.textTert }} />}
                required
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(255,80,80,0.08)',
                  border: '1px solid rgba(255,80,80,0.20)',
                }}
              >
                <AlertCircle style={{ width: 14, height: 14, color: '#fca5a5', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#fca5a5' }}>{error}</span>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading} variant="primary">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center mt-6" style={{ fontSize: 13, color: S.textTert }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium transition-colors hover:opacity-70"
            style={{ color: S.textSecond }}
          >
            Create one free
          </Link>
        </p>

      </div>
    </div>
  );
}
