'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

const LOG_ITEMS = [
  { time: 'JUST NOW', icon: ShieldAlert, text: 'Cross-platform driver risk score 28.5 detected for +91 99988XXXXX (Active on 2 platforms)', color: 'text-amber-400' },
  { time: '2 MINS AGO', icon: ShieldCheck, text: 'AI Protection Engine verified fare extortion in Peelamedu, Coimbatore', color: 'text-cyan-400' },
  { time: '5 MINS AGO', icon: AlertTriangle, text: 'State Transport Authority issued driver blacklist order for serial offender', color: 'text-red-400' },
  { time: '12 MINS AGO', icon: Activity, text: 'Rapido Operator Portal received routed complaint for investigation', color: 'text-blue-400' },
];

export default function LiveSecurityFeed() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % LOG_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = LOG_ITEMS[index];
  const Icon = current.icon;

  return (
    <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 backdrop-blur-xl">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
          VIGILANCE FEED
        </span>
      </div>

      <div className="h-4 w-px bg-slate-800 shrink-0" />

      <div className="flex-1 flex items-center justify-between overflow-hidden gap-3">
        <div className="flex items-center gap-2 text-xs truncate">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${current.color}`} />
          <span className="text-slate-200 font-medium truncate font-mono text-[11px]">
            {current.text}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono shrink-0 font-bold">
          {current.time}
        </span>
      </div>
    </div>
  );
}
