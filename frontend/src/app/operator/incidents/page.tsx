'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Search, Building2, LogOut, Inbox, Filter, ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import {
  getPortalUser, clearPortalToken, getOperatorIncidents,
  type PortalIncidentItem,
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
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              n.href === '/operator/incidents' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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

export default function OperatorIncidentsPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<ReturnType<typeof getPortalUser>>(null);
  const [incidents, setIncidents] = useState<PortalIncidentItem[]>([]);
  const [filtered, setFiltered] = useState<PortalIncidentItem[]>([]);
  const [search, setSearch] = useState('');
  const [routedOnly, setRoutedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = (routed: boolean) => {
    setLoading(true);
    getOperatorIncidents(0, 100, routed)
      .then(data => { setIncidents(data); setFiltered(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const user = getPortalUser();
    if (!user || user.role !== 'OPERATOR') { router.replace('/operator/login'); return; }
    setPortalUser(user);
    fetchIncidents(routedOnly);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = incidents;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.incident_type.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        (i.captain_name ?? '').toLowerCase().includes(q) ||
        (i.captain_phone ?? '').includes(q)
      );
    }
    setFiltered(result);
  }, [search, incidents]);

  const handleLogout = () => { clearPortalToken(); router.replace('/operator/login'); };

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      <OpNav portalUser={portalUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Incident & Complaint Log</h1>
            <p className="text-slate-400 text-sm mt-1">
              {filtered.length} incidents logged on {portalUser?.platform}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by incident type, captain, or location…"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
          </div>
          <button
            onClick={() => { const next = !routedOnly; setRoutedOnly(next); fetchIncidents(next); }}
            className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${
              routedOnly
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Routed Complaints Only</span>
          </button>
        </div>

        <GlassCard className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText className="w-10 h-10 mb-3 text-slate-700" />
              <p className="text-sm font-semibold">No incidents found</p>
              <p className="text-xs mt-1">When commuters submit or route complaints on {portalUser?.platform}, they appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-800/40">
                    <th className="text-left px-5 py-3 font-semibold">Incident / Location</th>
                    <th className="text-left px-5 py-3 font-semibold">Severity</th>
                    <th className="text-left px-5 py-3 font-semibold">Captain Details</th>
                    <th className="text-left px-5 py-3 font-semibold">Fare Difference</th>
                    <th className="text-left px-5 py-3 font-semibold">AI Verified</th>
                    <th className="text-left px-5 py-3 font-semibold">Routing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filtered.map(i => (
                    <tr key={i.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{i.incident_type}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">📍 {i.location}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          {i.incident_datetime ? new Date(i.incident_datetime).toLocaleString() : ''}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          i.severity === 'CRITICAL' ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
                          i.severity === 'HIGH' ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30' :
                          i.severity === 'MEDIUM' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {i.severity}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-200">{i.captain_name || 'Unknown Captain'}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{i.captain_phone || 'No phone'}</div>
                        {i.vehicle_number && <div className="text-slate-500 font-mono text-[10px]">🚲 {i.vehicle_number}</div>}
                      </td>
                      <td className="px-5 py-4">
                        {i.app_fare != null && i.demanded_fare != null ? (
                          <div>
                            <div className="text-red-400 font-bold">₹{i.demanded_fare} <span className="text-slate-500 text-[10px] font-normal">demanded</span></div>
                            <div className="text-slate-400 text-[10px]">App fare: ₹{i.app_fare}</div>
                          </div>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {i.ai_analysis_status === 'DONE' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                            <ShieldCheck className="w-3 h-3 text-purple-400" /> AI Verified
                          </span>
                        ) : <span className="text-slate-600 text-[10px]">Pending</span>}
                      </td>
                      <td className="px-5 py-4">
                        {i.routed_to_operator ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-lg font-bold">
                            <Inbox className="w-3 h-3 text-cyan-400" /> ROUTED TO YOU
                          </span>
                        ) : <span className="text-slate-600 text-[10px]">Log only</span>}
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
