'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Building2,
  Landmark,
  Users,
} from 'lucide-react';
import GlobeCanvas from '@/components/ui/GlobeCanvas';

// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: '5',        unit: 'Platforms',  label: 'Cross-platform ride sync'   },
  { value: '24/7',     unit: '',           label: 'AI-powered incident engine'  },
  { value: 'CPA 2019', unit: '',           label: 'Consumer protection aligned' },
];

const portals = [
  {
    role: 'Commuter',
    icon: Users,
    title: 'Commuter Portal',
    desc: 'File ride-extortion incidents, upload app screenshots and payment proofs, and receive AI-drafted Consumer Court notices.',
    href: '/login',
    cta: 'File a Complaint',
  },
  {
    role: 'Operator',
    icon: Building2,
    title: 'Operator Portal',
    desc: 'For Rapido, Ola, Uber compliance teams — review driver risk scores, inspect cross-platform flags, and act on routed complaints.',
    href: '/operator/login',
    cta: 'Operator Access',
  },
  {
    role: 'Government',
    icon: Landmark,
    title: 'State Transport Portal',
    desc: 'For RTOs and Regulators — view live incident heatmaps, evaluate platform compliance, and issue multi-platform blacklists.',
    href: '/government/login',
    cta: 'Government Access',
  },
];

const features = [
  {
    icon: ShieldAlert,
    title: 'Cross-Platform Identity Engine',
    body: 'Canonical identity resolution maps driver phone numbers and vehicle aliases across Rapido, Ola, Uber, Namma Yatri, and InDrive to surface repeat offenders.',
  },
  {
    icon: Sparkles,
    title: 'Multi-Modal AI Proof Engine',
    body: 'Gemini 3.8 Flash cross-checks ride screenshots, app fares, and UPI payment proofs to verify overcharge gaps and draft legal notices.',
  },
  {
    icon: Landmark,
    title: 'Regulatory Actioning',
    body: 'Complaints automatically sync to platform operators and State Transport Authorities for compliance review and binding blacklist orders.',
  },
];

// ─── Shared style tokens ───────────────────────────────────────────────────────
// Apple-style monochrome — no colour, extreme restraint
const S = {
  bg:           '#000000',
  surfaceCard:  'rgba(255,255,255,0.04)',
  borderSubtle: 'rgba(255,255,255,0.08)',
  borderFaint:  'rgba(255,255,255,0.05)',
  textPrimary:  '#f5f5f7',   // Apple's exact off-white
  textSecond:   '#86868b',   // Apple's secondary grey
  textTert:     '#515154',   // Apple's tertiary grey
};

// ─── Portal card with hover effect ────────────────────────────────────────────
interface PortalHoverCardProps {
  role: string;
  Icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  cta: string;
}

function PortalHoverCard({ role, Icon, title, desc, href, cta }: PortalHoverCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex flex-col rounded-2xl transition-all duration-300"
      style={{
        background: hovered ? 'rgba(255,255,255,0.06)' : S.surfaceCard,
        border: `1px solid ${hovered ? S.borderSubtle : S.borderFaint}`,
        padding: '28px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${S.borderSubtle}` }}
        >
          <Icon style={{ width: 18, height: 18, color: S.textPrimary }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: S.textTert, fontFamily: 'monospace' }}>
          {role}
        </span>
      </div>
      <h3 className="font-semibold mb-3" style={{ fontSize: 18, color: S.textPrimary }}>{title}</h3>
      <p className="flex-1 mb-8" style={{ fontSize: 13, color: S.textSecond, lineHeight: 1.7 }}>{desc}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-70"
        style={{ fontSize: 14, color: S.textPrimary }}
      >
        {cta}
        <ChevronRight style={{ width: 15, height: 15, color: S.textTert }} />
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen flex flex-col overflow-x-hidden font-sans antialiased"
      style={{ backgroundColor: S.bg, color: S.textPrimary }}
    >

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: `1px solid ${S.borderFaint}`,
        }}
      >
        <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Shield
              className="transition-opacity group-hover:opacity-70"
              style={{ width: 18, height: 18, color: S.textPrimary }}
            />
            <span
              className="font-semibold tracking-tight"
              style={{ fontSize: 16, color: S.textPrimary }}
            >
              FairRide<span style={{ color: S.textSecond }}>AI</span>
            </span>
          </Link>

          {/* Links + CTA */}
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors hover:bg-white/5"
              style={{ color: S.textSecond }}
            >
              Sign In
            </Link>
            <Link
              href="/operator/login"
              className="hidden sm:inline-block px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors hover:bg-white/5"
              style={{ color: S.textSecond }}
            >
              Operator
            </Link>
            <Link
              href="/government/login"
              className="hidden sm:inline-block px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors hover:bg-white/5"
              style={{ color: S.textSecond }}
            >
              Government
            </Link>

            {/* Primary CTA — Apple-style: white pill, dark text */}
            <Link
              href="/register"
              className="ml-2 inline-flex items-center gap-2 font-semibold rounded-full transition-all active:scale-[0.97]"
              style={{
                fontSize: 13,
                padding: '8px 18px',
                background: S.textPrimary,
                color: '#000000',
              }}
            >
              Report Incident
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      {/*
        Layout mirrors Apple's product pages:
        - Globe fills the entire hero as background
        - Headline + sub + CTA float in the lower-centre of the sphere
        - Stats anchored at the very bottom of the hero
      */}
      <section
        className="relative w-full"
        style={{ minHeight: 'calc(100vh - 56px)', overflow: 'hidden' }}
      >
        {/* Globe — absolute fill, cursor-grabbable */}
        <GlobeCanvas />

        {/* Text overlay — sits over the dark lower hemisphere */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{ paddingBottom: 88 }}
        >
          {/* Eyebrow — tiny, all-caps, Apple-style */}
          <p
            className="mb-5 font-medium uppercase tracking-widest"
            style={{ fontSize: 11, color: S.textTert, letterSpacing: '0.15em' }}
          >
            Commuter Protection · India
          </p>

          {/* Headline — large, white, no gradient */}
          <h1
            className="font-bold tracking-tight"
            style={{
              fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)',
              lineHeight: 1.05,
              color: S.textPrimary,
              maxWidth: 780,
              letterSpacing: '-0.02em',
            }}
          >
            Protecting Every Ride.{' '}
            <span style={{ color: S.textSecond }}>Seamlessly.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6"
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              color: S.textSecond,
              maxWidth: 540,
              lineHeight: 1.65,
            }}
          >
            Smart, reliable ride-extortion solutions across Rapido, Ola, Uber,
            Namma Yatri, and InDrive — anywhere your rights need protecting.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {/* Primary: white pill — Apple's standard */}
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 font-semibold rounded-full transition-all active:scale-[0.97]"
              style={{
                fontSize: 15,
                padding: '14px 28px',
                background: S.textPrimary,
                color: '#000000',
              }}
            >
              Get Started
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{ width: 24, height: 24, background: '#000000', flexShrink: 0 }}
              >
                <ArrowRight style={{ width: 12, height: 12, color: '#ffffff' }} />
              </span>
            </Link>

            {/* Secondary: ghost pill */}
            <a
              href="#portals"
              className="inline-flex items-center gap-1.5 font-semibold rounded-full transition-all active:scale-[0.97]"
              style={{
                fontSize: 15,
                padding: '14px 26px',
                color: S.textPrimary,
                background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${S.borderSubtle}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              Explore Portals
              <ChevronRight style={{ width: 15, height: 15, color: S.textTert }} />
            </a>
          </div>
        </div>

        {/* Stats bar — Apple product-page footer row */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-stretch justify-center"
          style={{
            borderTop: `1px solid ${S.borderFaint}`,
            background: 'rgba(0,0,0,0.50)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="flex items-center"
            >
              <div className="text-center" style={{ padding: '20px 48px' }}>
                <div
                  className="font-semibold"
                  style={{
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
                    color: S.textPrimary,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {s.value}
                  {s.unit && (
                    <span style={{ color: S.textSecond }}> {s.unit}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: S.textTert, marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
              {i < stats.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 36,
                    background: S.borderFaint,
                    alignSelf: 'center',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Portal Cards ─────────────────────────────────────────────────────── */}
      <section
        id="portals"
        style={{ borderTop: `1px solid ${S.borderFaint}` }}
      >
        <div className="max-w-6xl mx-auto px-6 py-28">

          {/* Section header */}
          <div className="mb-16 max-w-xl">
            <p
              className="mb-3 font-medium uppercase tracking-widest"
              style={{ fontSize: 11, color: S.textTert, letterSpacing: '0.15em' }}
            >
              Access Portals
            </p>
            <h2
              className="font-bold tracking-tight"
              style={{
                fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
                color: S.textPrimary,
                lineHeight: 1.12,
                letterSpacing: '-0.015em',
              }}
            >
              One system. <br />Three stakeholder views.
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {portals.map(p => {
              const Icon = p.icon;
              return (
                <PortalHoverCard
                  key={p.role}
                  role={p.role}
                  Icon={Icon}
                  title={p.title}
                  desc={p.desc}
                  href={p.href}
                  cta={p.cta}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${S.borderFaint}` }}>
        <div className="max-w-6xl mx-auto px-6 py-28">

          <div className="mb-16 max-w-xl">
            <p
              className="mb-3 font-medium uppercase tracking-widest"
              style={{ fontSize: 11, color: S.textTert, letterSpacing: '0.15em' }}
            >
              Core Architecture
            </p>
            <h2
              className="font-bold tracking-tight"
              style={{
                fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
                color: S.textPrimary,
                lineHeight: 1.12,
                letterSpacing: '-0.015em',
              }}
            >
              Built for accountability. <br />Designed for scale.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl"
                  style={{
                    background: S.surfaceCard,
                    border: `1px solid ${S.borderFaint}`,
                    padding: '28px',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${S.borderSubtle}`,
                    }}
                  >
                    <Icon style={{ width: 18, height: 18, color: S.textPrimary }} />
                  </div>
                  <h3
                    className="font-semibold mb-3"
                    style={{ fontSize: 16, color: S.textPrimary }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 13, color: S.textSecond, lineHeight: 1.7 }}>
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${S.borderFaint}`, background: S.bg }}>
        <div
          className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <Shield style={{ width: 14, height: 14, color: S.textTert }} />
            <span style={{ fontSize: 12, color: S.textTert }}>
              FairRideAI · National Ride Protection
            </span>
          </div>

          <p style={{ fontSize: 12, color: S.textTert }}>
            © 2026 FairRideAI · Consumer Protection Act, 2019
          </p>

          <div className="flex items-center gap-6" style={{ fontSize: 12 }}>
            {[
              { label: 'Home',       href: '/' },
              { label: 'Commuter',   href: '/login' },
              { label: 'Operator',   href: '/operator/login' },
              { label: 'Government', href: '/government/login' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-white"
                style={{ color: S.textTert }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
