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

/* ── Style maps — Apple monochrome system ── */
const variantCls: Record<Variant, string> = {
  primary: 'bg-[#f5f5f7] text-[#000000] font-semibold shadow-lg shadow-white/10 hover:bg-white hover:shadow-white/15 active:scale-[0.97]',
  cyan:    'bg-[#f5f5f7] text-[#000000] font-semibold shadow-lg shadow-white/10 hover:bg-white active:scale-[0.97]',
  outline: 'border border-[rgba(255,255,255,0.08)] text-[#f5f5f7] font-medium hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.05)] active:scale-[0.97]',
  ghost:   'text-[#86868b] font-medium hover:text-[#f5f5f7] hover:bg-[rgba(255,255,255,0.05)] active:scale-[0.97]',
  danger:  'bg-[rgba(255,80,80,0.10)] border border-[rgba(255,80,80,0.22)] text-[#fca5a5] font-semibold hover:bg-[rgba(255,80,80,0.16)] active:scale-[0.97]',
};

const sizeCls: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-full gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-full gap-2',
  lg: 'px-7 py-3.5 text-[15px] rounded-full gap-2.5 font-semibold',
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
