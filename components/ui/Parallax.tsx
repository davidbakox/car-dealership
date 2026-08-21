"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

// Moves its children against the scroll, so photos drift slower than the copy
// next to them and the page gains depth.
//
// The element must be able to overflow its slot — a parallaxed image that only
// fills its box will show a gap at one end, so callers either oversize the
// image (`-inset-y-*`, `scale-110`) or keep `distance` small.
export default function Parallax({
  children,
  distance = 60,
  className = "",
}: {
  children: ReactNode;
  /** Total travel in px across the whole time the element is on screen. */
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
