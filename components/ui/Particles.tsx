import type { CSSProperties } from "react";

// Drifting light motes for dark sections (hero, CTA bands, footer) and, at a
// lower density, behind the whole page.
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
  count = 22,
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
  /** Scales brightness and size together — 1 is the tuned default. */
  intensity?: number;
}) {
  const rand = mulberry32(seed);

  return (
    <div className={`particles ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        // Roughly one mote in six is a bigger, brighter "ember" — a field of
        // identical dots reads as noise, a field with a size hierarchy reads as
        // depth.
        const ember = rand() < 0.18;
        const size = (ember ? 4.5 + rand() * 4 : 1.8 + rand() * 3) * intensity;
        const style: CSSProperties = {
          left: `${rand() * 100}%`,
          top: `${rand() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          // Drift vector for the midpoint of the loop: mostly upward, with a
          // sideways lean so no two motes travel in parallel.
          ["--mote-x" as string]: `${(rand() - 0.5) * 70}px`,
          ["--mote-y" as string]: `${-24 - rand() * 60}px`,
          ["--mote-o" as string]: `${
            (ember ? 0.5 + rand() * 0.4 : 0.3 + rand() * 0.4) * intensity
          }`,
          ["--mote-blur" as string]: `${ember ? 14 : 8}px`,
          animationDuration: `${9 + rand() * 13}s`,
          // Negative delay starts every mote mid-cycle, so the field is already
          // alive on first paint instead of fading in together.
          animationDelay: `-${rand() * 20}s`,
        };
        return <span key={i} style={style} />;
      })}
    </div>
  );
}
