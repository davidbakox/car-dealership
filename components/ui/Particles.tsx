import type { CSSProperties } from "react";

// Drifting light motes for dark sections (hero, CTA bands, footer).
//
// Deliberately CSS-only: the field renders on the server as a handful of spans
// and ships no JavaScript, so it costs nothing on the Workers runtime and never
// blocks paint. Motion lives entirely in the `mote-drift` keyframes in
// globals.css, which the global prefers-reduced-motion rule already disables —
// with no animation the motes stay at their `opacity: 0` base style, so a
// reduced-motion visitor simply sees the section without them.
//
// Positions come from a seeded generator rather than Math.random(): the server
// and the client must produce identical markup or React reports a hydration
// mismatch. Pass a different `seed` per section so two fields on one page do
// not share the same constellation.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Particles({
  count = 16,
  seed = 1,
  className = "text-accent-hover",
}: {
  /** How many motes. Keep it low on small sections — these are an accent. */
  count?: number;
  /** Changes the layout of the field. Same seed ⇒ same constellation. */
  seed?: number;
  /** Container classes; the mote colour is inherited from `currentColor`. */
  className?: string;
}) {
  const rand = mulberry32(seed);

  return (
    <div className={`particles ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const size = 2 + rand() * 4; // 2–6px
        const style: CSSProperties = {
          left: `${rand() * 100}%`,
          top: `${rand() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          // Drift vector for the midpoint of the loop: mostly upward, with a
          // sideways lean so no two motes travel in parallel.
          ["--mote-x" as string]: `${(rand() - 0.5) * 48}px`,
          ["--mote-y" as string]: `${-18 - rand() * 42}px`,
          ["--mote-o" as string]: `${0.25 + rand() * 0.4}`,
          animationDuration: `${11 + rand() * 14}s`,
          // Negative delay starts every mote mid-cycle, so the field is already
          // alive on first paint instead of fading in together.
          animationDelay: `-${rand() * 20}s`,
        };
        return <span key={i} style={style} />;
      })}
    </div>
  );
}
