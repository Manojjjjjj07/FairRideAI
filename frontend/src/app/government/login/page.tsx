'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, ArrowLeft, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import {
  governmentLogin,
  governmentRegister,
  setPortalToken,
  setPortalUser,
  ApiError,
  type PortalUserResponse,
} from '@/lib/api';

const S = {
  bg:          '#000000',
  surface:     'rgba(255,255,255,0.04)',
  border:      'rgba(255,255,255,0.08)',
  textPrimary: '#f5f5f7',
  textSecond:  '#86868b',
  textTert:    '#515154',
};

export default function GovernmentLoginPage() {
  const router = useRouter();
  const [mode,         setMode]         = useState<'login' | 'register'>('login');
  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all required fields.'); return;
    }
    setLoading(true); setError(''); setSuccess('');

    try {
      if (mode === 'register') {
        await governmentRegister(name, email, password, jurisdiction || undefined);
        setSuccess('Account created! You can now sign in.');
        setMode('login');
      } else {
        const resp = await governmentLogin(email, password);
        setPortalToken(resp.access_token);
        const user: PortalUserResponse = {
          id: '', name: email.split('@')[0], email,
          role: 'GOVERNMENT', jurisdiction: resp.jurisdiction,
        };
        setPortalUser(user);
        router.replace('/government/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16 relative"
      style={{ backgroundColor: S.bg }}
    >
      {/* Back button */}
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

      <div className="w-full relative z-10" style={{ maxWidth: 400 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: S.surface, border: `1px solid ${S.border}` }}
          >
            <Landmark style={{ width: 20, height: 20, color: S.textPrimary }} />
          </div>
          <p
            className="mb-1 font-medium uppercase tracking-widest"
            style={{ fontSize: 10, color: S.textTert, letterSpacing: '0.15em', fontFamily: 'monospace' }}
          >
            Government
          </p>
          <h1
            className="font-bold tracking-tight"
            style={{ fontSize: 26, color: S.textPrimary, letterSpacing: '-0.015em' }}
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="mt-1.5" style={{ fontSize: 13, color: S.textSecond }}>
            {mode === 'login' ? 'State Transport Authority access' : 'Register your government account'}
          </p>
        </div>

        {/* Domain hint */}
        <div
          className="flex items-start gap-2.5 rounded-2xl mb-4"
          style={{
            background: S.surface,
            border: `1px solid ${S.border}`,
            padding: '14px 16px',
          }}
        >
          <Info style={{ width: 14, height: 14, color: S.textTert, flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 11, color: S.textSecond, lineHeight: 1.6 }}>
            Official government emails only. Supported:{' '}
            <span style={{ fontFamily: 'monospace', color: S.textPrimary }}>
              @gov.in, @nic.in, @tn.gov.in, @mh.gov.in
            </span>{' '}
            and other state domains. Use{' '}
            <span style={{ fontFamily: 'monospace', color: S.textPrimary }}>@gov.com</span>{' '}
            for demo access.
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl mb-4"
          style={{ background: S.surface, border: `1px solid ${S.border}`, padding: '28px' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {mode === 'register' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: 12, fontWeight: 500, color: S.textSecond }}>Full name</label>
                  <Input
                    id="gov-name"
                    placeholder="Officer name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: 12, fontWeight: 500, color: S.textSecond }}>
                    Jurisdiction <span style={{ color: S.textTert }}>(optional)</span>
                  </label>
                  <Input
                    id="gov-jurisdiction"
                    placeholder="e.g. Tamil Nadu, Maharashtra"
                    value={jurisdiction}
                    onChange={e => setJurisdiction(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 12, fontWeight: 500, color: S.textSecond }}>Government email</label>
              <Input
                id="gov-email"
                type="email"
                placeholder="officer@tn.gov.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon={<Mail style={{ width: 15, height: 15, color: S.textTert }} />}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 12, fontWeight: 500, color: S.textSecond }}>Password</label>
              <Input
                id="gov-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock style={{ width: 15, height: 15, color: S.textTert }} />}
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

            {success && (
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(80,255,160,0.06)',
                  border: '1px solid rgba(80,255,160,0.18)',
                }}
              >
                <span style={{ fontSize: 12, color: '#6ee7b7' }}>{success}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <p className="text-center" style={{ fontSize: 12, color: S.textTert }}>
              {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
              <button
                type="button"
                className="font-medium transition-colors hover:opacity-70"
                style={{ color: S.textSecond }}
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
              >
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </form>
        </div>

        {/* Cross-portal link */}
        <p className="text-center" style={{ fontSize: 12, color: S.textTert }}>
          Platform operator?{' '}
          <Link
            href="/operator/login"
            className="transition-colors hover:opacity-70"
            style={{ color: S.textSecond }}
          >
            Operator Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
