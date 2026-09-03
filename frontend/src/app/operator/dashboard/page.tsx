'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, AlertTriangle, ShieldAlert, ShieldX, FileText,
  Users, LogOut, ChevronRight, Activity, Inbox, Shield,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import {
  getPortalUser, clearPortalToken, getOperatorStats, getOperatorDrivers,
  type DashboardStats, type DriverProfileSummary,
} from '@/lib/api';

const STATUS_CONFIG = {
  NONE:                  { label: 'No Flag',          cls: 'bg-slate-700/60 text-slate-300',           dot: 'bg-slate-500'  },
  WATCHLIST:             { label: 'Watchlist',         cls: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',   dot: 'bg-amber-400'  },
  BLACKLIST_RECOMMENDED: { label: 'Action Needed',     cls: 'bg-orange-500/15 text-orange-300 border border-orange-500/30', dot: 'bg-orange-400' },
  BLACKLISTED:           { label: 'Blacklisted',       cls: 'bg-red-500/15 text-red-300 border border-red-500/30',         dot: 'bg-red-500'    },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.NONE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function RiskBar({ score }: { score: number }) {
  const pct = Math.min((score / 40) * 100, 100);
  const color = score >= 25 ? 'from-red-500 to-red-400' : score >= 10 ? 'from-amber-500 to-yellow-400' : 'from-emerald-500 to-green-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-white tabular-nums w-7 text-right">{score.toFixed(1)}</span>
    </div>
  );
}

export default function OperatorDashboardPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<ReturnType<typeof getPortalUser>>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [drivers, setDrivers] = useState<DriverProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getPortalUser();
    if (!user || user.role !== 'OPERATOR') { router.replace('/operator/login'); return; }
    setPortalUser(user);
    Promise.all([getOperatorStats(), getOperatorDrivers(0, 10)])
      .then(([s, d]) => { setStats(s); setDrivers(d); })
      .catch(() => router.replace('/operator/login'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => { clearPortalToken(); router.replace('/operator/login'); };

  const statCards = stats ? [
    { label: 'Total Incidents',      value: stats.total_incidents,      icon: <Activity className="w-5 h-5" />,    color: 'blue'   },
    { label: 'Routed Complaints',    value: stats.routed_complaints ?? 0, icon: <Inbox className="w-5 h-5" />,     color: 'cyan'   },
    { label: 'On Watchlist',         value: stats.watchlist_count,       icon: <AlertTriangle className="w-5 h-5" />, color: 'amber' },
    { label: 'Action Needed',        value: stats.blacklist_recommended, icon: <ShieldAlert className="w-5 h-5" />,   color: 'orange' },
    { label: 'Blacklisted',          value: stats.blacklisted,           icon: <ShieldX className="w-5 h-5" />,       color: 'red'    },
  ] : [];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/25 text-blue-400',
    cyan: 'from-cyan-600/20 to-cyan-600/5 border-cyan-500/25 text-cyan-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/25 text-amber-400',
    orange: 'from-orange-600/20 to-orange-600/5 border-orange-500/25 text-orange-400',
    red: 'from-red-600/20 to-red-600/5 border-red-500/25 text-red-400',
  };

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#070a14]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/40 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">{portalUser?.platform ?? 'Operator'} Portal</span>
              <span className="block text-[10px] text-slate-500">{portalUser?.email}</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/operator/dashboard',  label: 'Dashboard' },
              { href: '/operator/drivers',    label: 'Drivers'   },
              { href: '/operator/incidents',  label: 'Incidents' },
              { href: '/operator/reports',    label: 'Reports'   },
            ].map(n => (
              <Link key={n.href} href={n.href}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
                {n.label}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Driver Intelligence Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {portalUser?.platform} — monitoring incidents and flagged drivers on your platform
          </p>
        </div>

        {/* Stats strip */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {statCards.map(s => (
              <GlassCard key={s.label} className={`p-4 bg-gradient-to-br ${colorMap[s.color]} border`}>
                <div className={`${colorMap[s.color].split(' ').pop()} mb-2`}>{s.icon}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{s.label}</div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Driver risk table */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Top Flagged Drivers</h2>
            </div>
            <Link href="/operator/drivers"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-800/40 rounded-xl animate-pulse" />)}
            </div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Shield className="w-10 h-10 mb-3 text-slate-700" />
              <p className="text-sm font-semibold">No flagged drivers yet</p>
              <p className="text-xs mt-1">Driver profiles will appear here as complaints are filed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-800/40">
                    <th className="text-left px-5 py-3 font-semibold">Driver</th>
                    <th className="text-left px-5 py-3 font-semibold">Platform(s)</th>
                    <th className="text-left px-5 py-3 font-semibold">Risk Score</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-left px-5 py-3 font-semibold">Cross-Platform</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {drivers.map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white font-mono">{d.canonical_phone}</div>
                        {d.aliases?.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                            {d.aliases.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {(d.platforms ?? []).map(p => (
                            <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded-md text-slate-300 font-medium">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 w-36"><RiskBar score={d.risk_score} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={d.blacklist_status} /></td>
                      <td className="px-5 py-3.5">
                        {d.cross_platform_flag ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-lg font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            +{d.cross_platform_incidents} other platforms
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/operator/drivers/${d.id}`}
                          className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
