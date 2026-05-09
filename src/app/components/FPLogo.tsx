// FPLogo.tsx — FanPools logo component
// Three variants (full / mark / wordmark), three sizes (sm / md / lg), dark/light bg.

import React from 'react';
import { tokens as T } from '../styles/tokens';

interface FPLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'mark' | 'wordmark';
  bg?: 'dark' | 'light';
  onClick?: () => void;
}

const SCALES: Record<string, number> = { sm: 0.7, md: 1, lg: 1.6 };

export function FPLogo({ size = 'lg', variant = 'full', bg = 'dark', onClick }: FPLogoProps) {
  const s = SCALES[size] || 1;
  const textColor = bg === 'dark' ? T.text : '#0a0d10';
  const sq = Math.round(32 * s);
  const fs = Math.round(16 * s);

  const FSquare = () => (
    <div
      aria-hidden="true"
      style={{
        width: sq, height: sq, borderRadius: sq * 0.08,
        background: T.lime,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{
        fontFamily: T.mono, fontSize: sq * 0.54, fontWeight: 800,
        color: '#000', lineHeight: 1, letterSpacing: '-0.02em',
      }}>F</span>
    </div>
  );

  const Wordmark = () => (
    <span style={{
      fontFamily: T.mono, fontSize: fs, fontWeight: 800,
      color: textColor, letterSpacing: '0.06em',
    }}>
      FANPOOLS<span style={{ color: T.lime }}>.</span>
    </span>
  );

  if (variant === 'mark') {
    return <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}><FSquare /></div>;
  }

  if (variant === 'wordmark') {
    return <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}><Wordmark /></div>;
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: Math.round(12 * s),
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <FSquare />
      <Wordmark />
    </div>
  );
}
