'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Landmark, Activity, Users, ShieldAlert, ShieldX, MapPin,
  BarChart3, ChevronRight, LogOut, AlertTriangle, Layers,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import {
  getPortalUser, clearPortalToken, getGovernmentStats,
  getPlatformCompliance, getHeatmapData,
  type DashboardStats, type ComplianceItem, type HeatmapPoint,
} from '@/lib/api';

function StatCard({
  label, value, icon, colorClass,
}: {
  label: string; value: number | string; icon: React.ReactNode; colorClass: string;
}) {
  return (
    <GlassCard className={`p-4 bg-gradient-to-br border ${colorClass}`}>
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{label}</div>
    </GlassCard>
  );
}

function PlatformBar({ item, max }: { item: ComplianceItem; max: number }) {
  const pct = max > 0 ? Math.max((item.total_incidents / max) * 100, 4) : 4;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-28 text-xs font-semibold text-slate-300 shrink-0 truncate">{item.platform}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white w-8 text-right tabular-nums">{item.total_incidents}</span>
      {item.blacklisted_drivers_active > 0 && (
        <span className="text-[10px] text-red-300 bg-red-500/10 border border-red-500/25 px-1.5 py-0.5 rounded font-bold">
          {item.blacklisted_drivers_active} blacklisted
        </span>
      )}
    </div>
  );
}

// Lazy-loaded Leaflet map to avoid SSR issues
function HeatmapSection({ points }: { points: HeatmapPoint[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;
    if (mapInstanceRef.current) return;

    import('leaflet').then(L => {
      if (!mapRef.current) return;

      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });

      const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
      const avgLng = points.reduce((s, p) => s + p.lng, 0) / points.length;

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: true })
        .setView([avgLat, avgLng], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const severityColors: Record<string, string> = {
        CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e',
      };

      points.forEach(pt => {
        const color = severityColors[pt.severity?.toUpperCase()] ?? '#6366f1';
        const circle = L.circleMarker([pt.lat, pt.lng], {
          radius: 8,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.55,
        }).addTo(map);
        circle.bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;">
            <strong>${pt.platform}</strong><br/>
            ${pt.incident_type}<br/>
            <span style="color:${color};font-weight:bold;">${pt.severity}</span><br/>
            📍 ${pt.location}
          </div>
        `);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length]);

  if (points.length === 0) return (
    <div className="h-64 flex flex-col items-center justify-center text-slate-600">
      <MapPin className="w-8 h-8 mb-2 text-slate-700" />
      <p className="text-sm">No geo-tagged incidents yet</p>
      <p className="text-xs mt-1">Incidents with coordinates will appear here</p>
    </div>
  );

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className="flex gap-3 px-5 pb-2 flex-wrap">
        {[
          { label: 'Critical', color: '#ef4444' },
          { label: 'High',     color: '#f97316' },
          { label: 'Medium',   color: '#eab308' },
          { label: 'Low',      color: '#22c55e' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
      <div ref={mapRef} className="h-72 w-full rounded-b-2xl overflow-hidden" />
    </>
  );
}

export default function GovernmentDashboardPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<ReturnType<typeof getPortalUser>>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getPortalUser();
    if (!user || user.role !== 'GOVERNMENT') {
      router.replace('/government/login'); return;
    }
    setPortalUser(user);
    Promise.all([getGovernmentStats(), getPlatformCompliance(), getHeatmapData()])
      .then(([s, c, h]) => { setStats(s); setCompliance(c); setHeatmap(h); })
      .catch(() => router.replace('/government/login'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => { clearPortalToken(); router.replace('/government/login'); };

  const maxIncidents = compliance.reduce((m, c) => Math.max(m, c.total_incidents), 0);

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-[#070a14]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/30 to-purple-600/30 border border-violet-500/40 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">Government Portal</span>
              <span className="block text-[10px] text-slate-500">{portalUser?.jurisdiction ?? 'Transport Authority'}</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/government/dashboard',  label: 'Dashboard'    },
              { href: '/government/drivers',     label: 'Drivers'      },
              { href: '/government/incidents',   label: 'Incidents'    },
              { href: '/government/platforms',   label: 'Compliance'   },
              { href: '/government/reports',     label: 'Reports'      },
            ].map(n => (
              <Link key={n.href} href={n.href}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
                {n.label}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-800 px-3 py-1.5 rounded-xl transition-all">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">National Transport Intelligence</h1>
          <p className="text-slate-400 text-sm mt-1">
            Cross-platform driver misconduct overview — all platforms, all incidents
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Incidents"     value={stats.total_incidents}          icon={<Activity className="w-5 h-5 text-violet-400" />}     colorClass="from-violet-600/20 to-violet-600/5 border-violet-500/25" />
            <StatCard label="Drivers Tracked"     value={stats.total_drivers_tracked ?? 0} icon={<Users className="w-5 h-5 text-blue-400" />}         colorClass="from-blue-600/20 to-blue-600/5 border-blue-500/25" />
            <StatCard label="On Watchlist"         value={stats.watchlist_count}           icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}  colorClass="from-amber-600/20 to-amber-600/5 border-amber-500/25" />
            <StatCard label="Action Needed"        value={stats.blacklist_recommended}     icon={<ShieldAlert className="w-5 h-5 text-orange-400" />}   colorClass="from-orange-600/20 to-orange-600/5 border-orange-500/25" />
            <StatCard label="Blacklisted"          value={stats.blacklisted}               icon={<ShieldX className="w-5 h-5 text-red-400" />}          colorClass="from-red-600/20 to-red-600/5 border-red-500/25" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Heatmap */}
          <GlassCard className="lg:col-span-3 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-bold text-white">Incident Heatmap</h2>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{heatmap.length} geo-tagged incidents</span>
            </div>
            <HeatmapSection points={heatmap} />
          </GlassCard>

          {/* Platform compliance */}
          <GlassCard className="lg:col-span-2 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white">Platform Breakdown</h2>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-slate-800/40 rounded animate-pulse" />)}</div>
            ) : compliance.length === 0 ? (
              <p className="text-xs text-slate-600">No platform data yet</p>
            ) : (
              <div className="space-y-1">
                {compliance.map(item => <PlatformBar key={item.platform} item={item} max={maxIncidents} />)}
              </div>
            )}
            <Link href="/government/platforms"
              className="mt-4 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Full compliance report <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </GlassCard>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/government/drivers',   icon: <Users className="w-5 h-5" />,       label: 'Driver Registry',    desc: 'View all flagged drivers', color: 'violet' },
            { href: '/government/incidents', icon: <Activity className="w-5 h-5" />,    label: 'All Incidents',      desc: 'Browse all complaints',    color: 'blue'   },
            { href: '/government/platforms', icon: <BarChart3 className="w-5 h-5" />,   label: 'Compliance Report',  desc: 'Per-platform scorecards',  color: 'amber'  },
            { href: '/government/reports',   icon: <MapPin className="w-5 h-5" />,       label: 'Intelligence Reports', desc: 'AI-generated briefs',   color: 'emerald'},
          ].map(card => (
            <Link key={card.href} href={card.href}>
              <GlassCard className="p-4 hover:bg-slate-800/30 transition-all group cursor-pointer h-full">
                <div className={`text-${card.color}-400 mb-3 group-hover:scale-110 transition-transform`}>{card.icon}</div>
                <div className="text-sm font-bold text-white">{card.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{card.desc}</div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
