'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Lock,
  CheckCircle2,
  Plus,
  ChevronRight,
  Sparkles,
  MapPin,
  ShieldAlert,
  Zap,
  Car,
  Loader2,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import { getIncidents, type IncidentListItem, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// ─── Derived stats from real incidents ─────────────────────────────────────

function deriveStats(incidents: IncidentListItem[]) {
  const total    = incidents.length;
  const open     = incidents.filter((i) => i.status === 'open').length;
  const resolved = incidents.filter((i) => i.status === 'resolved').length;
  return [
    { label: 'Total Reports',      value: total,    icon: FileText,     gradient: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30' },
    { label: 'Active Open Cases',  value: open,     icon: ShieldAlert,  gradient: 'from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30' },
    { label: 'Resolved Incidents', value: resolved, icon: CheckCircle2, gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
  ];
}

// ─── Skeleton loader ────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-800 rounded w-1/3" />
        <div className="h-2 bg-slate-800 rounded w-1/2" />
      </div>
      <div className="w-5 h-5 bg-slate-800 rounded shrink-0" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [fetchErr,  setFetchErr]  = useState('');

  useEffect(() => {
    if (authLoading) return;           // Wait for auth check to complete
    getIncidents()
      .then(setIncidents)
      .catch((err) => {
        if (err instanceof ApiError) setFetchErr(err.message);
        else setFetchErr('Failed to load incidents.');
      })
      .finally(() => setLoading(false));
  }, [authLoading]);

  const stats = deriveStats(incidents);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' :
    'Good evening';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a14]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070a14]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 pb-28">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{greeting}, {firstName}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Commuter Protection Dashboard · Stay documented and protected.
            </p>
          </div>

          <Link href="/incidents/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all shrink-0">
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </Link>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <GlassCard key={s.label} padding="md" className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} border flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white tracking-tight">
                    {loading ? <Loader2 className="w-6 h-6 text-slate-500 animate-spin" /> : s.value}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* ── Quick Action Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <Link href="/incidents/new"
            className="glass-card glass-card-hover rounded-2xl p-6 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Report New Incident
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Guided 4-step reporting wizard with live fare calculator
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </Link>

          <div className="glass-card rounded-2xl p-6 flex items-center justify-between border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">AI Protection Engine</p>
                  <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-modal evidence analysis &amp; dispute generator
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Incident List ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Your Reported Incidents</span>
            </h2>
            {!loading && (
              <span className="text-xs text-slate-400 font-medium">
                {incidents.length} case{incidents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Error state */}
          {fetchErr && (
            <GlassCard className="text-center py-8">
              <p className="text-red-400 text-sm font-semibold">{fetchErr}</p>
            </GlassCard>
          )}

          {/* Loading skeleton */}
          {loading && !fetchErr && (
            <div className="space-y-3">
              <SkeletonRow /><SkeletonRow /><SkeletonRow />
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchErr && incidents.length === 0 && (
            <GlassCard className="text-center py-12">
              <Lock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-bold text-sm">No incidents reported yet</p>
              <p className="text-slate-500 text-xs mt-1 mb-5">
                Start documenting rides to build your evidence vault.
              </p>
              <Link href="/incidents/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:brightness-110 transition-all">
                <Plus className="w-4 h-4" /> Report First Incident
              </Link>
            </GlassCard>
          )}

          {/* Incident rows */}
          {!loading && !fetchErr && incidents.length > 0 && (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 group block"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                      <Car className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {inc.incident_type}
                        </span>
                        <Badge variant={inc.severity as BadgeVariant}>{inc.severity}</Badge>
                        <Badge variant={inc.status as BadgeVariant}>{inc.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">{inc.platform}</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ── Persistent FAB ── */}
      <Link
        href="/incidents/new"
        className="fixed bottom-6 right-6 flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-slate-950 font-extrabold px-6 py-3.5 rounded-full shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all z-20"
      >
        <Plus className="w-5 h-5 text-slate-950 stroke-[3]" />
        <span className="text-sm">Report Incident</span>
      </Link>

    </div>
  );
}
