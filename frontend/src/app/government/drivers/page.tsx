'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Search, ShieldX, Shield, Landmark, LogOut,
  AlertTriangle, Check, X, ChevronRight,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import {
  getPortalUser, clearPortalToken, getGovernmentDrivers,
  blacklistDriverGovernment, clearDriverBlacklist,
  type DriverProfileSummary,
} from '@/lib/api';

const STATUS_CONFIG = {
  NONE:                  { label: 'No Flag',     cls: 'bg-slate-700/60 text-slate-300',           dot: 'bg-slate-500'  },
  WATCHLIST:             { label: 'Watchlist',   cls: 'bg-amber-500/15 text-amber-300 border border-amber-500/30', dot: 'bg-amber-400' },
  BLACKLIST_RECOMMENDED: { label: 'Act Now',     cls: 'bg-orange-500/15 text-orange-300 border border-orange-500/30', dot: 'bg-orange-400' },
  BLACKLISTED:           { label: 'Blacklisted', cls: 'bg-red-500/15 text-red-300 border border-red-500/30', dot: 'bg-red-500' },
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
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-white w-7 text-right tabular-nums">{score.toFixed(1)}</span>
    </div>
  );
}

const GovNav = ({ portalUser, onLogout }: { portalUser: ReturnType<typeof getPortalUser>; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#070a14]/90 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/30 to-purple-600/30 border border-violet-500/40 flex items-center justify-center">
          <Landmark className="w-4 h-4 text-violet-400" />
        </div>
        <span className="text-sm font-bold text-white">Government Portal</span>
      </div>
      <nav className="hidden md:flex items-center gap-1">
        {[
          { href: '/government/dashboard', label: 'Dashboard' },
          { href: '/government/drivers',   label: 'Drivers'   },
          { href: '/government/incidents', label: 'Incidents' },
          { href: '/government/platforms', label: 'Compliance'},
          { href: '/government/reports',   label: 'Reports'   },
        ].map(n => (
          <Link key={n.href} href={n.href}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
            {n.label}
          </Link>
        ))}
      </nav>
      <button onClick={onLogout}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-800 px-3 py-1.5 rounded-xl transition-all">
        <LogOut className="w-3.5 h-3.5" /> Logout
      </button>
    </div>
  </header>
);

export default function GovernmentDriversPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<ReturnType<typeof getPortalUser>>(null);
  const [drivers, setDrivers] = useState<DriverProfileSummary[]>([]);
  const [filtered, setFiltered] = useState<DriverProfileSummary[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDrivers = (status?: string) => {
    setLoading(true);
    getGovernmentDrivers(0, 100, status === 'ALL' ? undefined : status)
      .then(d => { setDrivers(d); setFiltered(d); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const user = getPortalUser();
    if (!user || user.role !== 'GOVERNMENT') { router.replace('/government/login'); return; }
    setPortalUser(user);
    fetchDrivers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = drivers;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.canonical_phone.includes(q) ||
        (d.aliases ?? []).some(a => a.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [search, drivers]);

  const handleBlacklist = async (driverId: string) => {
    setActionLoading(driverId + '-bl');
    try {
      await blacklistDriverGovernment(driverId, 'Government authority action');
      fetchDrivers(statusFilter);
    } finally { setActionLoading(null); }
  };

  const handleClear = async (driverId: string) => {
    setActionLoading(driverId + '-cl');
    try {
      await clearDriverBlacklist(driverId);
      fetchDrivers(statusFilter);
    } finally { setActionLoading(null); }
  };

  const handleLogout = () => { clearPortalToken(); router.replace('/government/login'); };

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      <GovNav portalUser={portalUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Cross-Platform Driver Registry</h1>
            <p className="text-slate-400 text-sm mt-1">{filtered.length} drivers tracked across all platforms</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by phone or name…"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'WATCHLIST', 'BLACKLIST_RECOMMENDED', 'BLACKLISTED'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); fetchDrivers(s); }}
                className={`text-[10px] font-bold px-3 py-2 rounded-lg transition-all ${
                  statusFilter === s
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                    : 'text-slate-500 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {s === 'BLACKLIST_RECOMMENDED' ? 'ACT NOW' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <GlassCard className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Shield className="w-10 h-10 mb-3 text-slate-700" />
              <p className="text-sm font-semibold">No drivers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-800/40">
                    <th className="text-left px-5 py-3 font-semibold">Driver</th>
                    <th className="text-left px-5 py-3 font-semibold">Platforms</th>
                    <th className="text-left px-5 py-3 font-semibold">Risk Score</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-left px-5 py-3 font-semibold">Total Incidents</th>
                    <th className="text-left px-5 py-3 font-semibold">Actions</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filtered.map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white font-mono text-sm">{d.canonical_phone}</div>
                        {d.aliases?.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[160px]">
                            {d.aliases.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(d.platforms ?? []).map(p => (
                            <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded-md text-slate-300 font-medium">{p}</span>
                          ))}
                          {(d.platforms ?? []).length > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/25 rounded-md text-amber-300 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Multi
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 w-36"><RiskBar score={d.risk_score} /></td>
                      <td className="px-5 py-4"><StatusBadge status={d.blacklist_status} /></td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-white">{d.total_incidents}</span>
                        <span className="text-slate-500 ml-1">incidents</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {d.blacklist_status !== 'BLACKLISTED' ? (
                            <Button
                              variant="danger"
                              size="sm"
                              loading={actionLoading === d.id + '-bl'}
                              onClick={() => handleBlacklist(d.id)}
                            >
                              <ShieldX className="w-3 h-3" /> Blacklist
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              loading={actionLoading === d.id + '-cl'}
                              onClick={() => handleClear(d.id)}
                            >
                              <Check className="w-3 h-3" /> Clear
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/government/drivers/${d.id}`}
                          className="inline-flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Full Profile <ChevronRight className="w-3 h-3" />
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
