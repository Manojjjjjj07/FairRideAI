import React from 'react';

type ValidTag =
  | 'div' | 'section' | 'article' | 'aside'
  | 'main'  | 'header'  | 'li'     | 'form';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Adds hover state (card elevation + border gradient highlight + shadow glow) */
  hover?: boolean;
  /** Adds ambient accent glow shadow */
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: ValidTag;
}

const paddingMap: Record<string, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export default function GlassCard({
  children,
  className  = '',
  hover      = false,
  glow       = false,
  padding    = 'md',
  as: Tag    = 'div',
}: GlassCardProps) {
  const classes = [
    'glass-card rounded-2xl relative overflow-hidden',
    paddingMap[padding],
    hover ? 'glass-card-hover cursor-pointer' : '',
    glow  ? 'glow-blue'                       : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}
