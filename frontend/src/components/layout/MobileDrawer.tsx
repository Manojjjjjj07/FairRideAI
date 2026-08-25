'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, X, LogOut, LucideIcon } from 'lucide-react';
import { getStoredUser, clearToken, type UserResponse } from '@/lib/api';

interface NavLink {
  href:  string;
  label: string;
  icon?: LucideIcon;
}

interface MobileDrawerProps {
  isOpen:      boolean;
  onClose:     () => void;
  currentPath: string;
  navLinks:    NavLink[];
}

export default function MobileDrawer({
  isOpen,
  onClose,
  currentPath,
  navLinks,
}: MobileDrawerProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function handleLogout() {
    clearToken();
    onClose();
    router.replace('/login');
  }

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 left-0 bottom-0 w-80 z-50 glass-card border-r border-slate-800 shadow-2xl animate-in slide-in-from-left duration-250">
        <div className="flex flex-col h-full p-6 bg-slate-950/90 backdrop-blur-2xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5"
              onClick={onClose}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center glow-cyan">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                FairRide<span className="text-gradient-cyan">AI</span>
              </span>
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-1.5 flex-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = currentPath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
                  ].join(' ')}
                >
                  {Icon && <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User profile footer */}
          <div className="pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-sm font-bold text-cyan-300">
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Account'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email ?? ''}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
