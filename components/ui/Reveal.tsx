"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Scroll-in wrapper. Everything about the entrance is nudged off the grid: the
// delay, the duration, the distance and a fraction of a degree of rotation all
// carry a per-index jitter, so a row of cards arrives like a hand dealt them
// rather than like a slideshow stepping through. The jitter is derived from the
// index, not random, so a card animates identically on every visit.
const jitter = (i: number) => {
  const v = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return v - Math.floor(v); // 0…1, stable for a given index
};

export default function Reveal({
  children,
  index = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const j = jitter(index);
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: 20 + j * 16,
      x: (j - 0.5) * 10,
      rotate: (j - 0.5) * 1.1,
      scale: 0.985,
    },
    show: { opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 },
  };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
      transition={{
        duration: 0.55 + j * 0.3,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.08 + j * 0.1, 0.6),
      }}
    >
      {children}
    </MotionTag>
  );
}
