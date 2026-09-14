'use client';

import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { useState } from 'react';

const S = {
  surfaceCard:  'rgba(255,255,255,0.04)',
  borderSubtle: 'rgba(255,255,255,0.08)',
  borderFaint:  'rgba(255,255,255,0.05)',
  textPrimary:  '#f5f5f7',
  textSecond:   '#86868b',
  textTert:     '#515154',
};

interface PortalCardProps {
  role: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  cta: string;
}

export default function PortalCard({ role, icon: Icon, title, desc, href, cta }: PortalCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col rounded-2xl transition-all duration-300"
      style={{
        background: hovered ? 'rgba(255,255,255,0.06)' : S.surfaceCard,
        border: `1px solid ${hovered ? S.borderSubtle : S.borderFaint}`,
        padding: '28px',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon + role badge */}
      <div className="flex items-center justify-between mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${S.borderSubtle}`,
          }}
        >
          <Icon style={{ width: 18, height: 18, color: S.textPrimary }} />
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: S.textTert,
            fontFamily: 'monospace',
          }}
        >
          {role}
        </span>
      </div>

      <h3
        className="font-semibold mb-3"
        style={{ fontSize: 18, color: S.textPrimary }}
      >
        {title}
      </h3>
      <p
        className="flex-1 mb-8"
        style={{ fontSize: 13, color: S.textSecond, lineHeight: 1.7 }}
      >
        {desc}
      </p>

      {/* Apple-style inline text CTA */}
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
