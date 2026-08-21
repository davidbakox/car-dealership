"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

// Hairline at the very top of the viewport that fills as the page is read.
// Spring-smoothed so a flicked scroll glides instead of snapping.
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
