"use client";

import { useEffect, useRef, useState } from "react";

// A soft light that follows the cursor across the page.
//
// Desktop only, and only for visitors who have not asked for reduced motion —
// both are checked once on mount rather than in CSS, because there is no reason
// to attach a pointermove listener at all on a phone. The listener is passive
// and rAF-gated: at most one style write per frame, no layout reads.
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !calm);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      if (frame.current) return;
      const { clientX, clientY } = event;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--cursor-x", `${clientX}px`);
        el.style.setProperty("--cursor-y", `${clientY}px`);
        el.style.opacity = "1";
      });
    };

    const onLeave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
