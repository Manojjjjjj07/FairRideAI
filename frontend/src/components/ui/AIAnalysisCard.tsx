'use client';

import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Scale,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';
import { triggerAnalysis, type AIAnalysisData, ApiError } from '@/lib/api';

interface AIAnalysisCardProps {
  incidentId: string;
  status: string | null;
  rawResult: string | null;
  rawError: string | null;
  onAnalysisComplete: () => void;
}

export default function AIAnalysisCard({
  incidentId,
  status,
  rawResult,
  rawError,
  onAnalysisComplete,
}: AIAnalysisCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(rawError);
  const [copied, setCopied] = useState(false);

  let parsedResult: AIAnalysisData | null = null;
  if (rawResult) {
    try {
      parsedResult = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult;
    } catch {
      parsedResult = null;
    }
  }

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      await triggerAnalysis(incidentId);
      onAnalysisComplete();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to run AI analysis. Please check your backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyComplaint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStatus = loading ? 'PROCESSING' : status ?? 'PENDING';

  return (
    <GlassCard className="border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-900/40 to-indigo-950/20 p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 glow-cyan">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">AI Protection Engine</h2>
              <span className="text-[10px] font-bold bg-purple-500/25 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-modal evidence verification &amp; Consumer Court complaint generator
            </p>
          </div>
        </div>

        {currentStatus === 'DONE' && (
          <Button
            onClick={handleRunAnalysis}
            loading={loading}
            variant="outline"
            size="sm"
            className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-analyze</span>
          </Button>
        )}
      </div>

      {/* ── STATE 1: PENDING / NOT STARTED ── */}
      {currentStatus === 'PENDING' && (
        <div className="text-center py-6 px-4 bg-slate-950/40 rounded-xl border border-purple-500/20">
          <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 text-purple-300">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm font-bold text-white mb-1">
            Run Multi-Modal Evidence Investigation
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            Gemini 3.8 Flash will inspect your uploaded app screenshots, payment proofs, and incident facts to verify fare extortion and draft a Consumer Court dispute notice under the Indian Consumer Protection Act 2019.
          </p>
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-300 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button
            onClick={handleRunAnalysis}
            loading={loading}
            variant="cyan"
            size="md"
            className="shadow-lg shadow-purple-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyse Evidence with Gemini 3.8 Flash</span>
          </Button>
        </div>
      )}

      {/* ── STATE 2: PROCESSING ── */}
      {currentStatus === 'PROCESSING' && (
        <div className="text-center py-10 px-4 bg-slate-950/50 rounded-xl border border-purple-500/30">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-purple-200">
            Gemini 3.8 Flash is analyzing your evidence…
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Extracting fare details, cross-checking receipts, and generating legal complaint draft.
          </p>
        </div>
      )}

      {/* ── STATE 3: FAILED ── */}
      {currentStatus === 'FAILED' && (
        <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-red-200 mb-1">AI Analysis Failed</p>
          <p className="text-xs text-red-300/80 mb-4">{error || rawError || 'Unable to complete AI analysis.'}</p>
          <Button onClick={handleRunAnalysis} loading={loading} variant="primary" size="sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </Button>
        </div>
      )}

      {/* ── STATE 4: DONE (PARSED RESULTS) ── */}
      {currentStatus === 'DONE' && parsedResult && (
        <div className="space-y-5">
          {/* Verification Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* App Fare Verification */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  parsedResult.fare_verification?.confirmed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {parsedResult.fare_verification?.confirmed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200">App Fare Evidence</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {parsedResult.fare_verification?.notes || 'No notes provided.'}
                </p>
              </div>
            </div>

            {/* Payment Proof Verification */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  parsedResult.payment_verification?.confirmed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {parsedResult.payment_verification?.confirmed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200">Payment Receipt Evidence</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {parsedResult.payment_verification?.notes || 'No notes provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Executive Risk Assessment */}
          {parsedResult.risk_assessment && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Executive Risk Assessment</span>
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {parsedResult.risk_assessment}
              </p>
            </div>
          )}

          {/* Consumer Court Complaint Draft */}
          {parsedResult.complaint_draft && (
            <div className="rounded-xl bg-slate-950/80 border border-purple-500/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-purple-950/40 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">
                    Consumer Court Dispute Complaint Notice
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                    CPA 2019 Ready
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyComplaint(parsedResult!.complaint_draft)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Draft</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 overflow-x-auto">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {parsedResult.complaint_draft}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
