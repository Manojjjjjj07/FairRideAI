'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, User, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authRegister, authLogin, getMe, setToken, setStoredUser, ApiError } from '@/lib/api';
import { useRedirectIfAuth } from '@/lib/auth';

const perks = [
  'Free lifetime account',
  'Encrypted evidence storage vault',
  'Multi-modal AI evidence analysis',
];

export default function RegisterPage() {
  const router = useRouter();
  useRedirectIfAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 8)          { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');

    try {
      // 1. Create account
      await authRegister({ name, email, password });

      // 2. Auto-login to get the token
      const { access_token } = await authLogin({ email, password });
      setToken(access_token);

      // 3. Fetch and store user profile
      const me = await getMe();
      setStoredUser(me);

      // 4. Navigate to dashboard
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-[#070a14]">
      
      {/* Mesh glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back button */}
      <Link href="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
          <p className="text-slate-400 text-xs mt-1">Start protecting your rides with evidence</p>
        </div>

        {/* Perks list */}
        <div className="flex flex-col gap-2 mb-6 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/60">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">{perk}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl border-t border-slate-700/60 shadow-2xl">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            <Input
              label="Full name"
              id="register-name"
              type="text"
              placeholder="Manoj S.K"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Email address"
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Password"
              id="register-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              hint="Minimum 8 characters"
              required
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-300 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading} variant="cyan" className="mt-2">
              {loading ? 'Creating account…' : 'Create Free Account'}
            </Button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login"
            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
