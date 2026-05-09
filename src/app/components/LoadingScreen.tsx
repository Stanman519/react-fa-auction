// LoadingScreen.tsx — terminal-boot loading screen
// Replaces the old pulsing stanfan-color-logo.png in SmartHome + PrivateRoute.

import React, { useEffect, useState } from 'react';
import { tokens as T } from '../styles/tokens';
import { FPLogo } from './FPLogo';
import './loading.css';

interface LoadingScreenProps {
  variant?: 'default' | 'error';
}

interface StatusLine {
  text: string;
  status: string;
  color: string;
  delay: number;
}

export function LoadingScreen({ variant = 'default' }: LoadingScreenProps) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(i);
  }, []);

  const statusLines: StatusLine[] = variant === 'error'
    ? [
        { text: 'AUTH0 CONNECTION', status: 'ERR', color: T.red, delay: 0 },
        { text: 'RETRY IN 5s', status: '...', color: T.amber, delay: 0.4 },
      ]
    : [
        { text: 'AUTH0 SESSION', status: 'OK', color: T.lime, delay: 0 },
        { text: 'PROFILE SYNC', status: '...', color: T.amber, delay: 0.4 },
        { text: 'LEAGUE DATA', status: '...', color: T.textMute, delay: 0.8 },
        { text: 'SIGNALR', status: 'WAIT', color: T.textMute, delay: 1.2 },
      ];

  return (
    <div
      role="status"
      aria-label="Loading FanPools"
      style={{
        width: '100%', minHeight: '100vh',
        background: T.bg, color: T.text, fontFamily: T.mono,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div className="fp-scanlines" />
      <div className="fp-scan-beam" />

      <div style={{
        position: 'absolute', top: 16, left: 16,
        fontSize: 9, color: T.textMute, letterSpacing: '0.12em',
      }}>
        FANPOOLS v2.4
      </div>
      <div style={{
        position: 'absolute', top: 16, right: 16,
        fontSize: 9, color: T.textMute, letterSpacing: '0.12em',
      }}>
        {new Date().toISOString().slice(0, 10)}
      </div>

      <div style={{ position: 'relative', marginBottom: 48 }}>
        <FPLogo size="lg" variant="full" bg="dark" />
        <div className="fp-logo-glow" />
      </div>

      <div style={{ width: 260 }}>
        {statusLines.map((line, i) => (
          <div
            key={i}
            className="fp-fadein"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 0', fontSize: 10, letterSpacing: '0.08em',
              animationDelay: `${line.delay}s`,
            }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: 1, background: line.color,
              }}
              className={line.status === '...' ? 'fp-pulse-dot' : undefined}
            />
            <span style={{ flex: 1, color: T.textDim }}>{line.text}</span>
            <span style={{ color: line.color, fontWeight: 700 }}>{line.status}</span>
          </div>
        ))}
      </div>

      <div style={{ width: 260, marginTop: 20 }}>
        <div style={{
          height: 3, background: T.panel2, borderRadius: 1, overflow: 'hidden',
        }}>
          <div
            className={variant === 'error' ? undefined : 'fp-bar-grow'}
            style={{
              height: '100%',
              background: variant === 'error' ? T.red : T.lime,
              width: variant === 'error' ? '15%' : undefined,
            }}
          />
        </div>
        <div style={{
          marginTop: 10, fontSize: 10, color: T.textDim,
          textAlign: 'center', letterSpacing: '0.06em',
        }}>
          {variant === 'error' ? (
            <span>
              <span style={{ color: T.red }}>CONNECTION FAILED</span>
              {' · '}
              <span style={{ color: T.amber }}>RETRYING</span>
            </span>
          ) : (
            <span>INITIALIZING{'.'.repeat(dots)}</span>
          )}
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 3, alignItems: 'flex-end', height: 20,
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="fp-bar-dance"
            style={{
              width: 3, height: 20, background: T.lime, borderRadius: 1,
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${0.6 + (i % 5) * 0.15}s`,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>
    </div>
  );
}
