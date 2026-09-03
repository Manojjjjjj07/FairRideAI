'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, ArrowLeft, AlertTriangle, ShieldX, ShieldCheck, Building2, LogOut,
  FileText, Check,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import {
  getPortalUser, clearPortalToken, getOperatorDriver, watchlistDriver,
  blacklistDriverOperator,
} from '@/lib/api';

const OpNav = ({ portalUser, onLogout }: { portalUser: ReturnType<typeof getPortalUser>; onLogout: () => void }) => (
  <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#070a14]/90 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/40 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-blue-400" />
        </div>
        <span className="text-sm font-bold text-white">{portalUser?.platform ?? 'Operator'} Portal</span>
      </div>
      <nav className="hidden md:flex items-center gap-1">
        {[
          { href: '/operator/dashboard', label: 'Dashboard' },
          { href: '/operator/drivers',   label: 'Drivers'   },
          { href: '/operator/incidents', label: 'Incidents' },
          { href: '/operator/reports',   label: 'Reports'   },
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

export default function OperatorDriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: driverId } = use(params);
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<ReturnType<typeof getPortalUser>>(null);
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDriver = () => {
    setLoading(true);
    getOperatorDriver(driverId)
      .then(d => setDriver(d))
      .catch(() => router.replace('/operator/drivers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const user = getPortalUser();
    if (!user || user.role !== 'OPERATOR') { router.replace('/operator/login'); return; }
    setPortalUser(user);
    fetchDriver();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  const handleWatchlist = async () => {
    setActionLoading(true);
    try { await watchlistDriver(driverId); fetchDriver(); }
    finally { setActionLoading(false); }
  };

  const handleBlacklist = async () => {
    setActionLoading(true);
    try { await blacklistDriverOperator(driverId, 'Confirmed via Operator Portal review'); fetchDriver(); }
    finally { setActionLoading(false); }
  };

  const handleLogout = () => { clearPortalToken(); router.replace('/operator/login'); };

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      <OpNav portalUser={portalUser} onLogout={handleLogout} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/operator/drivers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Driver Registry
        </Link>

        {loading || !driver ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-white font-mono">{driver.canonical_phone}</h1>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase ${
                      driver.blacklist_status === 'BLACKLISTED' ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
                      driver.blacklist_status === 'BLACKLIST_RECOMMENDED' ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30' :
                      driver.blacklist_status === 'WATCHLIST' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {driver.blacklist_status}
                    </span>
                  </div>
                  {driver.aliases?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">Known Name Aliases: <span className="text-slate-200 font-semibold">{driver.aliases.join(', ')}</span></p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {driver.blacklist_status !== 'WATCHLIST' && driver.blacklist_status !== 'BLACKLISTED' && (
                    <Button variant="outline" size="sm" loading={actionLoading} onClick={handleWatchlist}>
                      Move to Watchlist
                    </Button>
                  )}
                  {driver.blacklist_status !== 'BLACKLISTED' && (
                    <Button variant="danger" size="sm" loading={actionLoading} onClick={handleBlacklist}>
                      <ShieldX className="w-3.5 h-3.5" /> Confirm Blacklist
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Cross-Platform Flag Banner */}
            {driver.cross_platform_flag && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Cross-Platform Misconduct Warning</h3>
                  <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
                    This phone number has <span className="font-bold text-white">+{driver.cross_platform_count} additional incident(s)</span> reported on other platforms ({(driver.other_platforms ?? []).join(', ')}). Total cross-platform risk score: <span className="font-bold text-white">{driver.risk_score}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Platform Incidents */}
            <div>
              <h2 className="text-base font-bold text-white mb-3">Incidents on {portalUser?.platform}</h2>
              <div className="space-y-3">
                {(driver.platform_incidents ?? []).map((inc: any) => (
                  <GlassCard key={inc.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{inc.incident_type}</span>
                        <span className="text-slate-500 text-xs ml-2">📍 {inc.location}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(inc.incident_datetime).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">{inc.description}</p>
                    {inc.demanded_fare && (
                      <div className="text-xs text-red-400 mt-2 font-bold">
                        Demanded ₹{inc.demanded_fare} (App fare: ₹{inc.app_fare})
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
