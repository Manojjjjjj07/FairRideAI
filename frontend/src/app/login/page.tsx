'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard';
    }, 1100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-[#070a14]">
      
      {/* Mesh glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back button */}
      <Link href="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-[400px] relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-slate-400 text-xs mt-1.5">Sign in to manage your protection cases</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 rounded-2xl border-t border-slate-700/60 shadow-2xl">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            <Input
              label="Email address"
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="flex flex-col gap-1.5">
              <Input
                label="Password"
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />
              <Link href="#"
                className="self-end text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-1 font-medium">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3
                              text-xs text-red-300 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading} variant="primary">
              {loading ? 'Authenticating…' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register"
            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
            Create one free
          </Link>
        </p>

      </div>
    </div>
  );
}
