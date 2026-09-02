'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  ShieldCheck,
  FileText,
  CreditCard,
  Mic,
  MessageSquare,
  Calendar,
  MapPin,
  User,
  Phone,
  Sparkles,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import AIAnalysisCard from '@/components/ui/AIAnalysisCard';
import type { BadgeVariant } from '@/components/ui/Badge';
import { getIncident, type IncidentDetail, type EvidenceItem, ApiError } from '@/lib/api';


// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
}

const evidenceIconMap: Record<string, React.ElementType> = {
  SCREENSHOT:    FileText,
  PAYMENT_PROOF: CreditCard,
  AUDIO:         Mic,
  CHAT_EXPORT:   MessageSquare,
  OTHER:         FileText,
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function FareComparison({ app, demanded }: { app: number; demanded: number }) {
  const diff = demanded - app;
  const pct  = ((diff / app) * 100).toFixed(0);

  return (
    <GlassCard className="border-red-500/30 bg-red-500/5">
      <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-4">
        <AlertTriangle className="w-4 h-4" />
        <span>Fare Discrepancy Breakdown</span>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="text-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium mb-1">Official App Fare</p>
          <p className="text-2xl font-black text-slate-100">₹{app}</p>
        </div>

        <div className="text-center flex flex-col items-center">
          <ArrowRight className="w-6 h-6 text-red-400 mb-1" />
          <p className="text-sm font-extrabold text-red-400">+₹{diff}</p>
          <p className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full mt-1">
            +{pct}% OVERCHARGE
          </p>
        </div>

        <div className="text-center p-4 rounded-xl bg-red-500/15 border border-red-500/30 shadow-lg shadow-red-500/10">
          <p className="text-xs text-red-300 font-medium mb-1">Cash Demanded</p>
          <p className="text-2xl font-black text-red-200">₹{demanded}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function InfoRow({ label, value, icon: Icon }: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/80 last:border-0 text-xs">
      <span className="text-slate-400 font-medium flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
        {label}
      </span>
      <span className="text-slate-200 font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function EvidenceCard({ ev }: { ev: EvidenceItem }) {
  const Icon = evidenceIconMap[ev.evidence_type] ?? FileText;
  const filename = ev.file_path.split('/').pop() ?? ev.file_path;
  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-white truncate">{ev.evidence_type.replace('_', ' ')}</p>
        <p className="text-[10px] text-slate-500 truncate mt-0.5">{filename}</p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const fetchIncident = () => {
    if (!id) return;
    getIncident(id)
      .then(setIncident)
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 404) setError('Incident not found.');
          else if (err.status === 403) setError('You do not have access to this incident.');
          else setError(err.message);
        } else {
          setError('Failed to load incident. Is the backend running?');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);


  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070a14]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error || !incident) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070a14]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <GlassCard className="max-w-md w-full text-center py-10">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-white font-bold text-sm mb-1">Could not load incident</p>
            <p className="text-slate-400 text-xs mb-6">{error}</p>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  const inc = incident;

  return (
    <div className="min-h-screen flex flex-col bg-[#070a14]">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 pb-24">

        {/* Back Link */}
        <Link href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header Summary Card */}
        <GlassCard className="mb-6 border-t border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={inc.severity as BadgeVariant}>{inc.severity} severity</Badge>
                <Badge variant={inc.status as BadgeVariant}>{inc.status}</Badge>
                <span className="text-xs text-slate-400 font-semibold">• {inc.platform}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white">{inc.incident_type}</h1>
            </div>

            <Link href="/incidents/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-600/20 text-cyan-300 border border-blue-500/40 px-3.5 py-2 rounded-xl hover:bg-blue-600/30 transition-all shrink-0">
              <Plus className="w-4 h-4" />
              <span>Add Proof</span>
            </Link>
          </div>

          <div className="pt-2">
            <InfoRow label="Location" value={inc.location} icon={MapPin} />
            <InfoRow label="Incident Time" value={formatDatetime(inc.incident_datetime)} icon={Calendar} />
            <InfoRow label="Case File Created" value={formatDatetime(inc.created_at)} icon={Clock} />
          </div>
        </GlassCard>

        {/* Fare Discrepancy Card */}
        {inc.app_fare != null && inc.demanded_fare != null && (
          <div className="mb-6">
            <FareComparison app={inc.app_fare} demanded={inc.demanded_fare} />
          </div>
        )}

        {/* Captain Information */}
        {(inc.captain_name || inc.captain_phone) && (
          <GlassCard className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Captain Information
            </h3>
            {inc.captain_name  && <InfoRow label="Captain Name" value={inc.captain_name} icon={User} />}
            {inc.captain_phone && <InfoRow label="Phone / Vehicle No." value={inc.captain_phone} icon={Phone} />}
          </GlassCard>
        )}

        {/* Description */}
        <GlassCard className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Incident Description
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
            {inc.description}
          </p>
        </GlassCard>

        {/* Evidence Grid */}
        <GlassCard className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Attached Evidence ({inc.evidences.length} file{inc.evidences.length !== 1 ? 's' : ''})
          </h3>

          {inc.evidences.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No evidence files attached.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {inc.evidences.map((ev) => <EvidenceCard key={ev.id} ev={ev} />)}
            </div>
          )}
        </GlassCard>

        {/* AI Protection Engine Status */}
        <AIAnalysisCard
          incidentId={inc.id}
          status={inc.ai_analysis_status}
          rawResult={inc.ai_analysis_result}
          rawError={inc.ai_analysis_error}
          onAnalysisComplete={fetchIncident}
        />


      </main>
    </div>
  );
}
