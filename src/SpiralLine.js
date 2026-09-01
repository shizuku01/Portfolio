// =============================================================================
// SPIRAL LINE - a continuously rippling, glowing line down the Journal page
// =============================================================================
// Not a static wave-shape scrolling through a fixed window - the path itself
// is recomputed every frame, so the waves genuinely travel and ripple along
// the line, like a rope being shaken, while the line stays put in its frame.
//
// Each point along the line's height is offset sideways by the sum of three
// sine waves with different frequencies/speeds/directions - a classic
// "water surface" technique. Because the three periods rarely line back up
// with each other, the motion never looks like it's visibly repeating.
//
// The stroke is a gradient (dim accent -> a bright glowing point -> dim
// accent) whose bright point travels down the gradient every frame too, so
// a soft pulse of light continuously runs the length of the line.

import React, { useEffect, useRef } from 'react';

// Randomized once per mount, so the exact rhythm differs on every reload
// without needing to touch these numbers by hand.
function makeWaves() {
  const rand = (min, max) => min + Math.random() * (max - min);
  return [
    { freq: rand(0.004, 0.007), speed: rand(0.00022, 0.00034), amp: rand(20, 30), phase: rand(0, 6) },
    { freq: rand(0.009, 0.015), speed: -rand(0.00035, 0.00055), amp: rand(10, 16), phase: rand(0, 6) },
    { freq: rand(0.0018, 0.0032), speed: rand(0.00012, 0.0002), amp: rand(24, 36), phase: rand(0, 6) },
  ];
}

// Smooth curve through a list of {x, y} points using each midpoint as the
// curve's anchor and the raw point as the control - no library needed, and
// it stays smooth no matter how the points move frame to frame.
function buildSmoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = ((curr.x + next.x) / 2).toFixed(1);
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x.toFixed(1)} ${curr.y}, ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y}`;
  return d;
}

// How far the moving light stop sits from the two stops bracketing it -
// smaller = a tighter, more concentrated glow.
const GLOW_BAND = 0.09;
// How long one full top-to-bottom sweep of the light takes, in ms.
const GLOW_PERIOD = 4200;

function SpiralLine() {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const wavesRef = useRef(makeWaves());
  const dimsRef = useRef({ width: 180, height: window.innerHeight });

  const stopBeforeRef = useRef(null);
  const stopMidRef = useRef(null);
  const stopAfterRef = useRef(null);

  useEffect(() => {
    const measure = () => {
      dimsRef.current = {
        width: wrapRef.current ? wrapRef.current.clientWidth : 180,
        height: window.innerHeight,
      };
    };
    measure();
    window.addEventListener('resize', measure);

    const gap = 12; // px between sample points along the line - smaller = smoother
    let frameId;

    const step = (t) => {
      const { width, height } = dimsRef.current;
      const centerX = width / 2;
      const points = [];
      for (let y = 0; y <= height; y += gap) {
        let x = centerX;
        for (const w of wavesRef.current) {
          x += w.amp * Math.sin(y * w.freq + t * w.speed + w.phase);
        }
        points.push({ x, y });
      }
      if (pathRef.current) {
        pathRef.current.setAttribute('d', buildSmoothPath(points));
      }

      // Sweep the bright gradient stop from top (0) to bottom (1) on a
      // loop. The two flanking stops trail/lead it and clamp at the ends
      // so the glow fades in and out naturally at the edges of the line.
      const pos = (t % GLOW_PERIOD) / GLOW_PERIOD;
      const mid = pos;
      const before = Math.max(0, mid - GLOW_BAND);
      const after = Math.min(1, mid + GLOW_BAND);
      if (stopBeforeRef.current) stopBeforeRef.current.setAttribute('offset', before.toFixed(3));
      if (stopMidRef.current) stopMidRef.current.setAttribute('offset', mid.toFixed(3));
      if (stopAfterRef.current) stopAfterRef.current.setAttribute('offset', after.toFixed(3));

      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="spiral-line" ref={wrapRef} aria-hidden="true">
      <svg className="spiral-line-svg" width="100%" height="100%">
        <defs>
          <linearGradient id="spiral-line-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop ref={stopBeforeRef} offset="0" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop ref={stopMidRef} offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop ref={stopAfterRef} offset="0" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          fill="none"
          stroke="url(#spiral-line-glow)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default SpiralLine;
