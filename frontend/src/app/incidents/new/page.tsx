'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Trash2,
  Image as ImageIcon,
  CreditCard,
  Mic,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  User,
  Phone,
  IndianRupee,
  Zap,
  Sparkles,
  ArrowRight,
  FilePlus,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import LocationPicker from '@/components/ui/LocationPicker';
import { createIncident, uploadEvidence, ApiError } from '@/lib/api';

/* ── Form Data Type ── */
type FormData = {
  incident_type:      string;
  severity:           string;
  platform:           string;
  incident_datetime:  string;
  location:           string;
  latitude:           number | null;
  longitude:          number | null;
  captain_name:       string;
  captain_phone:      string;
  app_fare:           string;
  demanded_fare:      string;
  description:        string;
};

const INCIDENT_TYPES = [
  'Fare Extortion',
  'Forced Cancellation',
  'Off-Platform Payment Demand',
  'Captain Harassment',
  'Intimidation / Threats',
  'Other',
];

const PLATFORMS = [
  'Rapido', 'Ola', 'Uber', 'Namma Yatri', 'Bounce', 'InDrive', 'Other',
];

const SEVERITY_OPTIONS = [
  { value: 'LOW',      label: 'Low',      color: 'border-slate-700 text-slate-300', active: 'bg-emerald-500/20 border-emerald-500 text-emerald-300' },
  { value: 'MEDIUM',   label: 'Medium',   color: 'border-slate-700 text-slate-300', active: 'bg-amber-500/20 border-amber-500 text-amber-300' },
  { value: 'HIGH',     label: 'High',     color: 'border-slate-700 text-slate-300', active: 'bg-rose-500/20 border-rose-500 text-rose-300'   },
  { value: 'CRITICAL', label: 'Critical', color: 'border-slate-700 text-slate-300', active: 'bg-red-500/30 border-red-500 text-red-200 font-bold' },
];

const STEPS = [
  { label: 'Incident Details' },
  { label: 'Captain & Fare'   },
  { label: 'Description'      },
  { label: 'Upload Evidence'  },
];

const EVIDENCE_TYPES = [
  { value: 'SCREENSHOT',    label: 'Screenshot',    icon: ImageIcon },
  { value: 'PAYMENT_PROOF', label: 'Payment Proof', icon: CreditCard },
  { value: 'AUDIO',         label: 'Audio',         icon: Mic },
  { value: 'CHAT_EXPORT',   label: 'Chat Export',   icon: MessageSquare },
  { value: 'OTHER',         label: 'Other',         icon: FileText },
];

type EvidenceFile = { id: string; name: string; type: string; size: string };

/* ── Progress Indicator ── */
function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Step {current + 1} of {total}
        </span>
        <span className="text-xs font-semibold text-slate-300">
          {STEPS[current].label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={[
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 shrink-0',
              i < current
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : i === current
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/40'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-500',
            ].join(' ')}>
              {i < current ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={[
                'h-1 flex-1 mx-2 rounded-full transition-all duration-500',
                i < current ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-slate-800',
              ].join(' ')} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Live Overcharge Callout ── */
function FareGap({ app, demanded }: { app: string; demanded: string }) {
  const a = parseFloat(app)      || 0;
  const d = parseFloat(demanded) || 0;
  if (!a || !d || d <= a) return null;
  const diff = d - a;
  const pct  = ((diff / a) * 100).toFixed(0);

  return (
    <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 shadow-lg shadow-red-500/5">
      <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-wider mb-3">
        <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
        <span>Overcharge Detected</span>
      </div>

      <div className="grid grid-cols-3 gap-3 items-center text-center">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">App Fare</span>
          <p className="text-lg font-black text-slate-200">₹{a.toFixed(0)}</p>
        </div>

        <div className="flex flex-col items-center">
          <ArrowRight className="w-5 h-5 text-red-400 mb-1" />
          <span className="text-xs font-bold text-red-400">+₹{diff.toFixed(0)}</span>
        </div>

        <div className="bg-red-500/15 p-3 rounded-xl border border-red-500/30">
          <span className="text-[10px] text-red-300 block font-medium">Demanded</span>
          <p className="text-lg font-black text-red-200">₹{d.toFixed(0)}</p>
        </div>
      </div>

      <div className="mt-3 text-center pt-2 border-t border-red-500/20">
        <span className="text-xs font-bold text-red-300">
          Captain demanded +{pct}% extra cash outside the app
        </span>
      </div>
    </div>
  );
}

export default function NewIncidentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [fileObjects, setFileObjects] = useState<{ id: string; file: File; type: string }[]>([]);
  const [evidenceType, setEvidenceType] = useState('SCREENSHOT');

  const [form, setForm] = useState<FormData>({
    incident_type:     '',
    severity:          '',
    platform:          '',
    incident_datetime: '',
    location:          '',
    latitude:          null,
    longitude:         null,
    captain_name:      '',
    captain_phone:     '',
    app_fare:          '',
    demanded_fare:     '',
    description:       '',
  });

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const canNext = (): boolean => {
    if (step === 0) return !!(form.incident_type && form.severity && form.platform && form.incident_datetime && form.location);
    if (step === 1) return true;
    if (step === 2) return form.description.trim().length >= 20;
    return true;
  };

  const next = () => { if (step < 3) setStep((s) => s + 1); };
  const back = () => { if (step > 0) setStep((s) => s - 1); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const mapped: EvidenceFile[] = files.map((f) => ({
      id:   Math.random().toString(36).slice(2),
      name: f.name,
      type: evidenceType,
      size: `${(f.size / 1024).toFixed(0)} KB`,
    }));
    // Track the actual File objects for uploading
    const objMapped = files.map((f, i) => ({ id: mapped[i].id, file: f, type: evidenceType }));
    setEvidenceFiles((prev) => [...prev, ...mapped]);
    setFileObjects((prev) => [...prev, ...objMapped]);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setEvidenceFiles((prev) => prev.filter((f) => f.id !== id));
    setFileObjects((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      // 1. Create the incident
      const payload = {
        incident_type:     form.incident_type,
        severity:          form.severity,
        description:       form.description,
        platform:          form.platform,
        captain_name:      form.captain_name || undefined,
        captain_phone:     form.captain_phone || undefined,
        app_fare:          form.app_fare     ? parseFloat(form.app_fare)     : undefined,
        demanded_fare:     form.demanded_fare ? parseFloat(form.demanded_fare) : undefined,
        incident_datetime: form.incident_datetime
          ? new Date(form.incident_datetime).toISOString()
          : new Date().toISOString(),
        location:          form.location,
        latitude:          form.latitude ?? undefined,
        longitude:         form.longitude ?? undefined,
      };
      const { id } = await createIncident(payload);
      setCreatedId(id);

      // 2. Upload each evidence file
      for (const item of fileObjects) {
        await uploadEvidence(id, item.type, item.file);
      }

      setSubmitted(true);
      // Redirect to the new incident's detail page after 2s
      setTimeout(() => router.replace(`/incidents/${id}`), 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to submit. Is the backend running?');
      }
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070a14]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <GlassCard className="p-10 max-w-md w-full text-center border-emerald-500/30">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6 glow-cyan">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Incident Report Filed!</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-8">
              Your incident case file has been encrypted and stored safely. When our AI analysis engine finishes processing your evidence, your dispute report will be updated.
            </p>
            <div className="flex flex-col gap-3">
              <Button href="/dashboard" fullWidth size="lg" variant="primary">
                Go to Dashboard
              </Button>
              <Button href="/incidents/new" variant="outline" fullWidth>
                Report Another Incident
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070a14]">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 pb-20">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-3">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FilePlus className="w-6 h-6 text-cyan-400" />
            <span>Report Ride Incident</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Document fare extortion, harassment, or forced cancellations with proof.
          </p>
        </div>

        {/* Step Progress */}
        <GlassCard className="p-6 mb-6">
          <StepProgress current={step} total={STEPS.length} />
        </GlassCard>

        {/* Main Wizard Form Card */}
        <GlassCard className="p-6 sm:p-8">

          {/* ═══ STEP 1 ═══ */}
          {step === 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                1. Incident Classification
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Incident Type <span className="text-red-400">*</span>
                </label>
                <select
                  className="select-glass"
                  value={form.incident_type}
                  onChange={set('incident_type')}
                >
                  <option value="" disabled>Select incident type…</option>
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Severity Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  Severity Level <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, severity: opt.value }))}
                      className={[
                        'px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer',
                        form.severity === opt.value ? opt.active : opt.color,
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Ride Platform <span className="text-red-400">*</span>
                </label>
                <select
                  className="select-glass"
                  value={form.platform}
                  onChange={set('platform')}
                >
                  <option value="" disabled>Select ride app…</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Date & Time of Incident"
                id="incident-datetime"
                type="datetime-local"
                value={form.incident_datetime}
                onChange={set('incident_datetime')}
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Pickup / Drop Location <span className="text-red-400">*</span>
                </label>
                <LocationPicker
                  value={form.location}
                  onChange={(address, lat, lng) =>
                    setForm((f) => ({ ...f, location: address, latitude: lat, longitude: lng }))
                  }
                />
              </div>
            </div>
          )}

          {/* ═══ STEP 2 ═══ */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">2. Captain & Fare Discrepancy</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter fare numbers to auto-calculate the overcharge gap.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Captain Name"
                  id="captain-name"
                  type="text"
                  placeholder="As shown in ride app"
                  value={form.captain_name}
                  onChange={set('captain_name')}
                  icon={<User className="w-4 h-4 text-slate-400" />}
                />
                <Input
                  label="Captain Phone / Vehicle No."
                  id="captain-phone"
                  type="text"
                  placeholder="+91 98765 43210 or KA01AB1234"
                  value={form.captain_phone}
                  onChange={set('captain_phone')}
                  icon={<Phone className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="App Fare (₹)"
                  id="app-fare"
                  type="number"
                  placeholder="120"
                  min="0"
                  value={form.app_fare}
                  onChange={set('app_fare')}
                  icon={<IndianRupee className="w-4 h-4 text-slate-400" />}
                  hint="Official fare shown in the app"
                />
                <Input
                  label="Demanded Cash Fare (₹)"
                  id="demanded-fare"
                  type="number"
                  placeholder="350"
                  min="0"
                  value={form.demanded_fare}
                  onChange={set('demanded_fare')}
                  icon={<IndianRupee className="w-4 h-4 text-slate-400" />}
                  hint="Extra cash fare captain asked for"
                />
              </div>

              <FareGap app={form.app_fare} demanded={form.demanded_fare} />
            </div>
          )}

          {/* ═══ STEP 3 ═══ */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">3. Written Account</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Describe what happened in detail (minimum 20 characters).
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-slate-300">
                  Incident Narrative <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  className="textarea-glass"
                  placeholder="Describe what the captain said, whether cash was demanded, threats made, or if you were forced to cancel the ride…"
                  value={form.description}
                  onChange={set('description')}
                  rows={6}
                />
                <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                  <span>Minimum 20 characters required</span>
                  <span className={form.description.length >= 20 ? 'text-emerald-400 font-bold' : ''}>
                    {form.description.length} chars
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 4 ═══ */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">4. Upload Proof & Evidence</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Attach ride screenshots, payment receipts, or audio clips.
                </p>
              </div>

              {/* Evidence Type Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">Evidence Category</label>
                <div className="flex flex-wrap gap-2">
                  {EVIDENCE_TYPES.map((et) => {
                    const Icon = et.icon;
                    const active = evidenceType === et.value;
                    return (
                      <button
                        key={et.value}
                        type="button"
                        onClick={() => setEvidenceType(et.value)}
                        className={[
                          'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                          active
                            ? 'bg-blue-600/20 border-blue-500 text-cyan-300'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200',
                        ].join(' ')}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{et.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Zone */}
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center gap-3
                           border-2 border-dashed border-slate-700/80 rounded-2xl p-8
                           cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5
                           transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">
                    Click to attach <span className="text-cyan-400">{EVIDENCE_TYPES.find((t) => t.value === evidenceType)?.label}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Images, PDFs, or Audio files • Max 50MB</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFile}
                />
              </label>

              {/* Uploaded File List */}
              {evidenceFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Attached Files ({evidenceFiles.length})
                  </p>
                  {evidenceFiles.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{f.name}</span>
                        <span className="text-slate-500">({f.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="mt-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <Button
              onClick={back}
              disabled={step === 0}
              variant="outline"
              size="md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {step < 3 ? (
              <Button
                onClick={next}
                disabled={!canNext()}
                variant="primary"
                size="md"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={submitting}
                variant="cyan"
                size="md"
              >
                <span>Submit Report</span>
                <ShieldCheck className="w-4 h-4" />
              </Button>
            )}
          </div>

        </GlassCard>

      </main>
    </div>
  );
}
