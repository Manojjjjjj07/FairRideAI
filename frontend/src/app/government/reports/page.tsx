'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Landmark, LogOut, Sparkles, Calendar, Plus, RefreshCw,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import {
  getPortalUser, clearPortalToken, getGovernmentReports, generateGovernmentReport,
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
              n.href === '/government/reports' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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

export default function GovernmentReportsPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<ReturnType<typeof getPortalUser>>(null);
  const [reports, setReports] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    getGovernmentReports()
      .then(data => setReports(data))
      .catch(err => {
        console.error("Failed to fetch reports:", err);
        setReports([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const user = getPortalUser();
    if (!user || user.role !== 'GOVERNMENT') { router.replace('/government/login'); return; }
    setPortalUser(user);
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (reportType: 'WEEKLY' | 'MONTHLY') => {
    setGenerating(true);
    setGenSuccess(null);
    try {
      await generateGovernmentReport(reportType);
      setGenSuccess(`✨ National ${reportType} Intelligence Report generated via Gemini 3.8 Flash!`);
      fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => { clearPortalToken(); router.replace('/government/login'); };

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      <GovNav portalUser={portalUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">National Transport Intelligence Reports</h1>
            <p className="text-slate-400 text-sm mt-1">
              Cross-platform executive intelligence briefs powered by Gemini 3.8 Flash for State Transport Authorities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="cyan"
              size="sm"
              loading={generating}
              onClick={() => handleGenerate('WEEKLY')}
              className="!from-violet-600 !via-purple-600 !to-indigo-600 !shadow-violet-500/25"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate Weekly Brief
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={generating}
              onClick={() => handleGenerate('MONTHLY')}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Generate Monthly Brief
            </Button>
          </div>
        </div>

        {genSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
            <span>{genSuccess}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : reports.length === 0 ? (
          <GlassCard className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center mb-4 text-violet-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Government Reports Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
              National intelligence briefs synthesize cross-platform driver misconduct patterns, city hotspot clusters, and compliance scorecards across Rapido, Ola, Uber, Namma Yatri, and InDrive using Gemini 3.8 Flash.
            </p>
            <div className="flex gap-3">
              <Button
                variant="cyan"
                size="sm"
                loading={generating}
                onClick={() => handleGenerate('MONTHLY')}
                className="!from-violet-600 !via-purple-600 !to-indigo-600"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate Monthly National Report Now
              </Button>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {reports.map((r: any) => (
              <GlassCard key={r.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 rounded-lg">
                      {r.report_type} NATIONAL REPORT
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" /> {r.period_start} → {r.period_end}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Generated: {new Date(r.generated_at).toLocaleString()}
                  </span>
                </div>
                {r.ai_brief && (
                  <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {r.ai_brief}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
