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
  Calendar,
  Zap,
  Clock,
  Car
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import Badge, { BadgeVariant } from '@/components/ui/Badge';

/* ── Mock statistics ── */
const stats = [
  { label: 'Total Reports', value: 7, icon: FileText, gradient: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Active Open Cases', value: 4, icon: ShieldAlert, gradient: 'from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30' },
  { label: 'Resolved Incidents', value: 3, icon: CheckCircle2, gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
];

const incidents: Array<{
  id:            string;
  incident_type: string;
  severity:      BadgeVariant;
  platform:      string;
  status:        BadgeVariant;
  location:      string;
  date:          string;
}> = [
  {
    id:            '1',
    incident_type: 'Fare Extortion',
    severity:      'high',
    platform:      'Rapido',
    status:        'open',
    location:      'Koramangala, Bengaluru',
    date:          'Aug 20, 2026',
  },
  {
    id:            '2',
    incident_type: 'Forced Cancellation',
    severity:      'medium',
    platform:      'Ola',
    status:        'resolved',
    location:      'T. Nagar, Chennai',
    date:          'Aug 17, 2026',
  },
  {
    id:            '3',
    incident_type: 'Off-Platform Payment',
    severity:      'high',
    platform:      'Uber',
    status:        'open',
    location:      'Andheri West, Mumbai',
    date:          'Aug 14, 2026',
  },
  {
    id:            '4',
    incident_type: 'Captain Harassment',
    severity:      'critical',
    platform:      'Namma Yatri',
    status:        'open',
    location:      'Indiranagar, Bengaluru',
    date:          'Aug 11, 2026',
  },
  {
    id:            '5',
    incident_type: 'Fare Extortion',
    severity:      'medium',
    platform:      'Rapido',
    status:        'resolved',
    location:      'Velachery, Chennai',
    date:          'Aug 8, 2026',
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a14]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 pb-28">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Good evening, Manoj</span>
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
                  <p className="text-3xl font-black text-white tracking-tight">{s.value}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* ── Quick Action Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          
          {/* Report New Incident CTA */}
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
                  Guided 3-step reporting wizard with live fare calculator
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </Link>

          {/* AI Protection Engine Status */}
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
                  Multi-modal evidence analysis & dispute generator
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
            <span className="text-xs text-slate-400 font-medium">
              Showing 5 recent cases
            </span>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 group block"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 shrink-0">
                    <Car className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {inc.incident_type}
                      </span>
                      <Badge variant={inc.severity}>{inc.severity}</Badge>
                      <Badge variant={inc.status}>{inc.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="font-semibold text-slate-300">{inc.platform}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {inc.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
                    {inc.date}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* ── Persistent Floating Action Button ── */}
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
