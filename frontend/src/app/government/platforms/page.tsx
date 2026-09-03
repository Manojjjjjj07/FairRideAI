'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, Landmark, LogOut, ShieldAlert, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import {
  getPortalUser, clearPortalToken, getPlatformCompliance,
  type ComplianceItem,
} from '@/lib/api';

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
          { href: '/government/dashboard', label: 'Dashboard'  },
          { href: '/government/drivers',   label: 'Drivers'    },
          { href: '/government/incidents', label: 'Incidents'  },
          { href: '/government/platforms', label: 'Compliance' },
          { href: '/government/reports',   label: 'Reports'    },
        ].map(n => (
          <Link key={n.href} href={n.href}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              n.href === '/government/platforms' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}>
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

export default function GovernmentPlatformsPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<ReturnType<typeof getPortalUser>>(null);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getPortalUser();
    if (!user || user.role !== 'GOVERNMENT') { router.replace('/government/login'); return; }
    setPortalUser(user);
    getPlatformCompliance()
      .then(data => setCompliance(data))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => { clearPortalToken(); router.replace('/government/login'); };

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      <GovNav portalUser={portalUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white">Platform Compliance Scorecards</h1>
          <p className="text-slate-400 text-sm mt-1">
            State Transport Authority compliance monitoring per Motor Vehicle Aggregator Guidelines
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-44 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : compliance.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-500">
            <BarChart3 className="w-10 h-10 mb-3 mx-auto text-slate-700" />
            <p className="text-sm font-semibold">No platform compliance data yet</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {compliance.map(item => (
              <GlassCard key={item.platform} className="p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{item.platform}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    item.blacklisted_drivers_active > 0
                      ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.blacklisted_drivers_active > 0 ? 'COMPLIANCE WARNING' : 'COMPLIANT'}
                  </span>
                </div>

                <div className="space-y-3 border-t border-slate-800/60 pt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Incidents Reported</span>
                    <span className="font-bold text-white tabular-nums">{item.total_incidents}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Routed to Govt Authority</span>
                    <span className="font-bold text-violet-400 tabular-nums">{item.routed_to_government}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Blacklisted Drivers Operating</span>
                    <span className={`font-bold tabular-nums ${item.blacklisted_drivers_active > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {item.blacklisted_drivers_active}
                    </span>
                  </div>
                </div>

                {item.blacklisted_drivers_active > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-[11px] text-red-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Action required: {item.blacklisted_drivers_active} blacklisted driver(s) still linked to this platform.</span>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
