'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, ArrowLeft, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import {
  governmentLogin,
  governmentRegister,
  setPortalToken,
  setPortalUser,
  ApiError,
  type PortalUserResponse,
} from '@/lib/api';

export default function GovernmentLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all required fields.'); return;
    }
    setLoading(true); setError(''); setSuccess('');

    try {
      if (mode === 'register') {
        await governmentRegister(name, email, password, jurisdiction || undefined);
        setSuccess('Account created! You can now log in.');
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-[#070a14]">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-700/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-700/8 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/30 to-purple-600/30 border border-violet-500/40 mb-4 shadow-lg shadow-violet-500/20">
            <Landmark className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Government Portal</h1>
          <p className="text-sm text-slate-400">
            {mode === 'login' ? 'State Transport Authority Access' : 'Register your government account'}
          </p>
        </div>

        <GlassCard className="p-6 mb-4">
          <div className="flex items-start gap-2.5 bg-violet-500/10 border border-violet-500/25 rounded-xl p-3 mb-5">
            <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-violet-300 leading-relaxed">
              Official government emails only. Supported: <span className="font-mono font-bold">@gov.in, @nic.in, @tn.gov.in, @mh.gov.in</span> and other state domains. Use <span className="font-mono font-bold">@gov.com</span> for demo access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <>
                <Input
                  id="gov-name"
                  label="Full Name"
                  placeholder="Officer name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <Input
                  id="gov-jurisdiction"
                  label="Jurisdiction (Optional)"
                  placeholder="e.g. Tamil Nadu, Maharashtra"
                  value={jurisdiction}
                  onChange={e => setJurisdiction(e.target.value)}
                />
              </>
            )}
            <Input
              id="gov-email"
              label="Government Email"
              type="email"
              placeholder="officer@tn.gov.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              id="gov-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-emerald-300">
                {success}
              </div>
            )}

            <Button type="submit" variant="primary" size="md" fullWidth loading={loading}
              className="!from-violet-600 !via-violet-500 !to-purple-600 !shadow-violet-500/25 hover:!shadow-violet-500/40">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">
            {mode === 'login' ? "Don't have an account? " : "Already registered? "}
            <button
              type="button"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </GlassCard>

        <p className="text-center text-xs text-slate-600">
          Are you a platform operator?{' '}
          <Link href="/operator/login" className="text-slate-400 hover:text-white transition-colors">
            Go to Operator Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
