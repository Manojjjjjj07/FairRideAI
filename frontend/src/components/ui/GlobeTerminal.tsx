'use client';

import GlobeCanvas from './GlobeCanvas';
import { Activity, Globe } from 'lucide-react';

export default function GlobeTerminal() {
  return (
    <div className="w-full max-w-lg mx-auto relative group">
      {/* Outer Phosphor Green Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff41]/30 via-emerald-500/20 to-[#00ff41]/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* CRT Monitor Heavy Metal Bezel */}
      <div className="relative bg-[#041007] border-2 border-[#00ff41]/50 rounded-3xl p-3 sm:p-4 shadow-[0_0_40px_rgba(0,255,65,0.15)] overflow-hidden font-mono text-[#00ff41]">
        
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#020b04] border border-[#00ff41]/30 rounded-xl mb-3 text-[11px] font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff41] animate-ping" />
            <span className="tracking-widest uppercase">FAIRRIDE_NET // GLOBAL MONITOR</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] opacity-80">
            <span>[CRT_FREQ: 15.6kHz]</span>
            <span className="hidden sm:inline">[60 FPS]</span>
          </div>
        </div>

        {/* CRT Screen Display Window */}
        <div className="relative w-full h-[360px] sm:h-[420px] bg-[#020904] border border-[#00ff41]/30 rounded-2xl overflow-hidden">
          
          {/* Subtle CRT Horizontal Scanlines Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-20 opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 3px)',
            }}
          />

          {/* CRT Screen Glass Glare Arc */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#00ff41]/10 to-transparent pointer-events-none z-20" />

          {/* Corner Crosshair Reticles */}
          <div className="absolute top-3 left-3 text-[10px] opacity-60 z-20 font-bold">+</div>
          <div className="absolute top-3 right-3 text-[10px] opacity-60 z-20 font-bold">+</div>
          <div className="absolute bottom-3 left-3 text-[10px] opacity-60 z-20 font-bold">+</div>
          <div className="absolute bottom-3 right-3 text-[10px] opacity-60 z-20 font-bold">+</div>

          {/* Globe Canvas Container */}
          <GlobeCanvas />

          {/* Bottom Screen Overlay Status */}
          <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[10px] bg-[#020b04]/90 border border-[#00ff41]/30 px-3 py-1.5 rounded-lg backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00ff41]" />
              GLOBAL EARTH MONITORING
            </span>
            <span className="opacity-70 font-mono">CONTINENTS: 7</span>
          </div>
        </div>

        {/* Terminal Footer Indicator */}
        <div className="flex items-center justify-between px-3 pt-3 text-[10px] opacity-75">
          <span>MEM: 640KB OK</span>
          <span>RETRO_ENGINE v1.972</span>
        </div>

      </div>
    </div>
  );
}
