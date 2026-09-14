'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';
import Link from 'next/link';

export default function LiveFareCalculator() {
  const [appFare, setAppFare] = useState<number>(120);
  const [demandedFare, setDemandedFare] = useState<number>(300);

  const overcharge = Math.max(0, demandedFare - appFare);
  const percentage = appFare > 0 ? Math.round((overcharge / appFare) * 100) : 0;
  const isExtortion = overcharge > 0;

  return (
    <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10 text-left relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Extortion Risk Engine</h3>
            <span className="text-[10px] text-slate-500 font-mono">[CPA 2019 COMPLIANT]</span>
          </div>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            App Shown Fare
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
            <input
              type="number"
              value={appFare}
              onChange={e => setAppFare(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/60 transition-colors font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Captain Demanded
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
            <input
              type="number"
              value={demandedFare}
              onChange={e => setDemandedFare(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-red-500/60 transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* Result Card */}
      {isExtortion ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-red-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Illegal Fare Extortion Detected
            </span>
            <span className="text-xs font-black text-red-300 font-mono bg-red-500/20 px-2 py-0.5 rounded-md">
              +{percentage}% MARKUP
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs text-slate-400 font-medium">Extra Cash Demanded:</span>
            <span className="text-lg font-black text-red-400 font-mono">₹{overcharge}</span>
          </div>

          <div className="text-[10px] text-red-300/80 pt-1 border-t border-red-500/20 flex items-center gap-1 font-mono">
            <Scale className="w-3 h-3 text-red-400 shrink-0" />
            Violates Consumer Protection Act, 2019 Sec 2(9)
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-5 flex items-center gap-3 text-xs text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Fare matches app ticket fare. No overcharging detected.</span>
        </div>
      )}

      <Link
        href="/register"
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-wider"
      >
        <span>Build Evidence Case Report</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
