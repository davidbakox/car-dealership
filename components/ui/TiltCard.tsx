"use client";

import { useRef, type ReactNode } from "react";

// Pointer-reactive card: the surface leans a few degrees toward the cursor and
// a soft light follows it across the face.
//
// Everything the pointer produces is written into CSS custom properties, so the
// styling — including whether the tilt applies at all — stays in globals.css.
// That is what lets touch devices and prefers-reduced-motion opt out with a
// media query instead of a JS branch: the handler may keep writing variables,
// but no rule reads them.
//
// getBoundingClientRect() is a layout read, so it runs inside the animation
// frame together with the writes; without the rAF gate a fast pointer sweep
// across a grid of cards would thrash layout on every mousemove.
export default function TiltCard({
  children,
  className = "",
  max = 5,
}: {
  children: ReactNode;
  /** Applied to the wrapper — pass the card's radius so the glow matches it. */
  className?: string;
  /** Maximum tilt in degrees at the card's edge. */
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (frame.current) return;
    const { clientX, clientY } = event;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      el.style.setProperty("--tilt-x", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--tilt-y", `${(px - 0.5) * max}deg`);
      el.style.setProperty("--glow-x", `${px * 100}%`);
      el.style.setProperty("--glow-y", `${py * 100}%`);
    });
  };

  const handleLeave = () => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
      <span className="tilt-glow" />
    </div>
  );
}
