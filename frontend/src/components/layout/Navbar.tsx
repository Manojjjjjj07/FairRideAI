'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Menu, LogOut, LayoutDashboard, FilePlus } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import { getStoredUser, clearToken, type UserResponse } from '@/lib/api';

export const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/incidents/new', label: 'Report Incident', icon: FilePlus },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleLogout() {
    clearToken();
    router.replace('/login');
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass-nav">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center group-hover:scale-105 transition-transform glow-cyan">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              FairRide<span className="text-gradient-cyan">AI</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/80">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
                  ].join(' ')}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right — avatar + logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-cyan-300">
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-300">{user?.name ?? 'Account'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800/60 transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </nav>
      </header>

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentPath={pathname}
        navLinks={navLinks}
      />
    </>
  );
}
