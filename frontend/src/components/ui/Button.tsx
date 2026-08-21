'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'cyan' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?:   Variant;
  size?:      Size;
  children:   React.ReactNode;
  fullWidth?: boolean;
  loading?:   boolean;
  className?: string;
}

interface AsButton extends BaseProps {
  href?:     undefined;
  onClick?:  () => void;
  disabled?: boolean;
  type?:     'button' | 'submit' | 'reset';
}

interface AsLink extends BaseProps {
  href:     string;
  onClick?: () => void;
}

type ButtonProps = AsButton | AsLink;

/* ── Style maps ── */
const variantCls: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 active:scale-[0.98]',
  cyan:    'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.98]',
  outline: 'bg-slate-900/40 border border-slate-700/60 text-slate-200 font-medium hover:bg-slate-800/60 hover:border-slate-500/60 hover:text-white active:scale-[0.98]',
  ghost:   'text-slate-300 font-medium hover:text-white hover:bg-white/5 active:scale-[0.98]',
  danger:  'bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-[0.98]',
};

const sizeCls: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5 font-semibold',
};

export default function Button(props: ButtonProps) {
  const {
    variant   = 'primary',
    size      = 'md',
    children,
    fullWidth = false,
    loading   = false,
    className = '',
  } = props;

  const disabled = 'disabled' in props ? props.disabled : false;

  const cls = [
    'inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer',
    variantCls[variant],
    sizeCls[size],
    fullWidth            ? 'w-full'                           : '',
    disabled || loading  ? 'opacity-50 pointer-events-none'   : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = loading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      <span>{children}</span>
    </>
  ) : (
    children
  );

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={cls} onClick={props.onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={('type' in props && props.type) ? props.type : 'button'}
      className={cls}
      onClick={'onClick' in props ? props.onClick : undefined}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
}
