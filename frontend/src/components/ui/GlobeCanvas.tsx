'use client';

import { useEffect, useRef } from 'react';

// ─── Dot type — unit-sphere coordinates + blink params ────────────────────────
interface Dot {
  x: number;     // pre-computed unit sphere x
  y: number;     // unit sphere y
  z: number;     // unit sphere z (z=1 faces camera at rotY=0)
  phase: number; // random blink phase (0–2π)
  freq:  number; // blink frequency (Hz-ish)
  size:  number; // dot radius multiplier
}

const TWO_PI = Math.PI * 2;

// Build dots once at module load — uniform density across the sphere
// via cosine-adjusted longitude count per latitude band
function buildDots(): Dot[] {
  const dots: Dot[] = [];
  const LAT_STEP = 6; // degrees

  for (let lat = -84; lat <= 84; lat += LAT_STEP) {
    const latR   = (lat * Math.PI) / 180;
    const cosLat = Math.cos(latR);
    const sinLat = Math.sin(latR);

    // More points near equator (large circumference), fewer near poles
    const n = Math.max(8, Math.round(60 * cosLat));

    for (let i = 0; i < n; i++) {
      const lngR = -Math.PI + (TWO_PI * i) / n;
      dots.push({
        // Store as unit-sphere coords — no conversion needed per-frame
        x: cosLat * Math.sin(lngR),
        y: sinLat,
        z: cosLat * Math.cos(lngR),
        phase: Math.random() * TWO_PI,
        freq:  0.3 + Math.random() * 0.9, // 0.3–1.2 blinks/sec — calm, organic
        size:  0.8 + Math.random() * 0.7,
      });
    }
  }
  return dots;
}

const DOTS = buildDots();

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0, animId = 0;

    function resize() {
      const el = canvas!.parentElement;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      W = width;
      H = height;
      canvas!.width  = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      canvas!.style.width  = W + 'px';
      canvas!.style.height = H + 'px';
      // setTransform resets + scales in one call — no cumulative scaling bug
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Rotation state ───────────────────────────────────────────────────
    let rotY = 0;     // horizontal spin (left/right drag)
    let rotX = 0.18;  // slight upward tilt to show top arc nicely
    let down = false, lx = 0, ly = 0;

    const onDown = (e: MouseEvent) => { down = true; lx = e.clientX; ly = e.clientY; };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      rotY += (e.clientX - lx) * 0.004;
      rotX  = Math.max(-0.5, Math.min(0.5, rotX + (e.clientY - ly) * 0.003));
      lx = e.clientX; ly = e.clientY;
    };
    const onUp = () => { down = false; };
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // ── Rotate a unit-sphere point ────────────────────────────────────────
    // Standard Y-axis then X-axis rotation matrices
    function rotatePoint(x: number, y: number, z: number) {
      // Y-axis rotation (horizontal globe spin)
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      const x1 =  x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      // X-axis rotation (vertical tilt)
      const cx = Math.cos(rotX), sx = Math.sin(rotX);
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      return { x: x1, y: y2, z: z2 };
    }

    // ── Render loop ──────────────────────────────────────────────────────
    let t = 0; // time accumulator in seconds

    function frame() {
      ctx.clearRect(0, 0, W, H);
      if (!down) rotY += 0.001; // slow, meditative rotation
      t += 0.016;               // ~60fps step

      const cx = W / 2;
      const cy = H * 0.48;
      const r  = Math.min(W * 0.50, H * 0.82);

      // ── 1. Dark sphere ─────────────────────────────────────────────────
      {
        const g = ctx.createRadialGradient(cx - r * 0.12, cy - r * 0.2, r * 0.01, cx, cy, r);
        g.addColorStop(0.0, '#111111');
        g.addColorStop(0.4, '#0a0a0a');
        g.addColorStop(0.8, '#050505');
        g.addColorStop(1.0, '#020202');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TWO_PI);
        ctx.fill();
      }

      // ── 2. Blinking dot layer ──────────────────────────────────────────
      type VDot = { sx: number; sy: number; z: number; dotR: number; a: number };
      const visible: VDot[] = [];

      for (const dot of DOTS) {
        const rot = rotatePoint(dot.x, dot.y, dot.z);

        // ── KEY FIX: only cull the true back hemisphere ──
        // rot.z is a unit value [-1, +1]
        // z < 0 → facing away from camera → skip
        if (rot.z < 0) continue;

        // ── KEY FIX: depth alpha mapped so EQUATOR (z=0) = 0.5 ──
        // Previous code had equator at 0.048 — nearly invisible
        // Now: z=0 → 0.5 (visible), z=1 → 1.0 (bright front)
        const depthAlpha = 0.5 + 0.5 * rot.z;

        // Individual blink: oscillates 0.2 (dim) → 1.0 (bright)
        // Each dot has its own phase so they blink independently
        const blink = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * dot.freq * TWO_PI + dot.phase));

        const a = depthAlpha * blink * 0.85;
        if (a < 0.03) continue;

        // Mild perspective: front dots slightly larger
        const persp = 1 + 0.12 * rot.z;
        const sx = cx + rot.x * r * persp;
        const sy = cy - rot.y * r * persp; // screen Y is flipped
        const dotR = dot.size * persp;

        visible.push({ sx, sy, z: rot.z, dotR, a });
      }

      // Back-to-front paint so closer dots overdraw farther ones
      visible.sort((a, b) => a.z - b.z);

      for (const p of visible) {
        ctx.fillStyle = `rgba(255,255,255,${p.a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, Math.max(0.5, p.dotR), 0, TWO_PI);
        ctx.fill();
      }

      // ── 3. Limb edge atmospheric glow ─────────────────────────────────
      {
        const limb = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.004);
        limb.addColorStop(0.0, 'rgba(255,255,255,0)');
        limb.addColorStop(0.7, 'rgba(255,255,255,0.015)');
        limb.addColorStop(1.0, 'rgba(255,255,255,0.07)');
        ctx.fillStyle = limb;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.004, 0, TWO_PI);
        ctx.fill();
      }

      // Sphere boundary stroke
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TWO_PI);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();
      ctx.restore();

      // Top specular arc — mimics overhead lighting on a smooth sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.998, (200 * Math.PI) / 180, (340 * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.lineWidth   = 1.2;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      className="cursor-grab active:cursor-grabbing"
    />
  );
}
