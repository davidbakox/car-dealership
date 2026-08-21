import type { CSSProperties } from "react";

// Drifting light motes. Used per section (hero, CTA bands, footer) and as one
// page-wide layer behind the whole site.
//
// Deliberately CSS-only: the field renders on the server as spans and ships no
// JavaScript, so it costs nothing on the Workers runtime and never blocks
// paint. Motion lives entirely in the `mote-drift` keyframes in globals.css,
// which the global prefers-reduced-motion rule already disables — with no
// animation the motes stay at their `opacity: 0` base style, so a
// reduced-motion visitor simply sees the section without them.
//
// Positions come from a seeded generator rather than Math.random(): the server
// and the client must produce identical markup or React reports a hydration
// mismatch. Pass a different `seed` per field so two of them on one page do not
// share the same constellation.
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
  count = 26,
  seed = 1,
  className = "text-accent-hover",
  intensity = 1,
}: {
  /** How many motes. */
  count?: number;
  /** Changes the layout of the field. Same seed ⇒ same constellation. */
  seed?: number;
  /** Container classes; the mote colour is inherited from `currentColor`. */
  className?: string;
  /** Scales brightness, size and glow together — 1 is the tuned default. */
  intensity?: number;
}) {
  const rand = mulberry32(seed);

  return (
    <div className={`particles ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        // Roughly one mote in four is a bigger, brighter ember. A field of
        // identically sized dots reads as noise; a size hierarchy reads as
        // depth, which is what lets the field be dense without looking dirty.
        const ember = rand() < 0.26;
        const size = (ember ? 5 + rand() * 5 : 2.2 + rand() * 3.4) * intensity;
        const style: CSSProperties = {
          left: `${rand() * 100}%`,
          top: `${rand() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          // Drift vector for the midpoint of the loop: mostly upward, with a
          // sideways lean so no two motes travel in parallel.
          ["--mote-x" as string]: `${(rand() - 0.5) * 80}px`,
          ["--mote-y" as string]: `${-28 - rand() * 70}px`,
          ["--mote-o" as string]: `${Math.min(
            1,
            (ember ? 0.6 + rand() * 0.4 : 0.38 + rand() * 0.42) * intensity
          )}`,
          ["--mote-blur" as string]: `${(ember ? 16 : 9) * intensity}px`,
          animationDuration: `${8 + rand() * 12}s`,
          // Negative delay starts every mote mid-cycle, so the field is already
          // alive on first paint instead of fading in together.
          animationDelay: `-${rand() * 20}s`,
        };
        return <span key={i} style={style} />;
      })}
    </div>
  );
}
