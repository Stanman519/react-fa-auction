// CrtOverlay.tsx — fixed-position CRT scanlines + slow scan beam.
// Reuses .fp-scanlines from loading.css; uses slower beam variant for ambient bg.

import React from 'react';
import './loading.css';

interface Props {
  intensity?: 'subtle' | 'normal' | 'strong';
}

export function CrtOverlay({ intensity = 'subtle' }: Props) {
  const scanlineOpacity =
    intensity === 'subtle' ? 0.75 : intensity === 'strong' ? 1.25 : 1;
  const beamOpacity =
    intensity === 'subtle' ? 0.1 : intensity === 'strong' ? 0.2 : 0.15;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        overflow: 'hidden',
      }}
    >
      <div className="fp-scanlines" style={{ opacity: scanlineOpacity }} />
      <div className="fp-scan-beam-slow" style={{ opacity: beamOpacity }} />
    </div>
  );
}
