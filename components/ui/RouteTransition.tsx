"use client";

import { useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import Logo from "@/components/public/Logo";

// Page switch: the screen is taken over by the wordmark inside a glowing disc,
// a blade of olive light sweeps across it, and sparks rise through the dark —
// then it clears to reveal the new page.
//
// Timing lives entirely in CSS keyframes (see `page-wipe*` in globals.css), so
// the whole sequence runs on the compositor and needs no animation library, no
// timers, and no state updates while it plays.
//
// The overlay is deliberately skipped on the very first page load. This module
// is evaluated once per browser session, so `hasNavigated` is false only for
// the first mount — after that every client-side navigation remounts
// template.tsx and plays the sequence. Covering the first paint would delay the
// hero for a visitor who is still deciding whether to stay, which is the one
// moment a flourish cannot be allowed to cost anything.
let hasNavigated = false;

// Deterministic spark layout — same reasoning as the mote fields: this renders
// during a client navigation, and a stable layout keeps the effect identical
// every time rather than occasionally clumping.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPARKS = (() => {
  const rand = mulberry32(20260821);
  return Array.from({ length: 80 }, () => {
    const size = 1.6 + rand() * 5.2;
    // Every fourth spark is the paler lime, so the shower is not one flat tone.
    const pale = rand() > 0.74;
    return {
      size,
      left: rand() * 100,
      top: 28 + rand() * 68,
      duration: 0.7 + rand() * 0.8,
      delay: rand() * 0.42,
      pale,
    };
  });
})();

export default function RouteTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  // Read the flag during the first render, then arm it for later navigations.
  const [play] = useState(() => {
    const first = !hasNavigated;
    hasNavigated = true;
    return !first;
  });

  if (reduce) return <>{children}</>;

  return (
    <>
      {play && (
        <div className="page-wipe" aria-hidden="true">
          <div className="page-wipe-sparks">
            {SPARKS.map((s, i) => (
              <span
                key={i}
                className={s.pale ? "is-pale" : undefined}
                style={{
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  animationDuration: `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </div>
          <div className="page-wipe-mark">
            <Logo size="lg" />
          </div>
        </div>
      )}
      <div className={play ? "page-in" : undefined}>{children}</div>
    </>
  );
}
