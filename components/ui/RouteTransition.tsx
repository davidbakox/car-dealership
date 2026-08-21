"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Branded page transition: an olive curtain wipes up off the new page while its
// content rises into place.
//
// The curtain is deliberately skipped on the very first page load. This module
// is evaluated once per browser session, so `hasNavigated` is false only for
// the first mount — after that every client-side navigation remounts
// template.tsx and plays the wipe. Covering the first paint would delay the
// hero for a visitor who is still deciding whether to stay, which is the one
// moment a flourish cannot be allowed to cost anything.
let hasNavigated = false;

export default function RouteTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  // Read the flag during the first render, then arm it for later navigations.
  const [showCurtain] = useState(() => {
    const first = !hasNavigated;
    hasNavigated = true;
    return !first;
  });

  if (reduce) return <>{children}</>;

  return (
    <>
      {showCurtain && (
        <motion.div
          className="route-curtain"
          aria-hidden="true"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.span
            className="route-curtain-mark"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.34, ease: "easeOut" }}
          >
            DENNIS <b>CARS</b>
          </motion.span>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: showCurtain ? 18 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: showCurtain ? 0.5 : 0.25,
          delay: showCurtain ? 0.16 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
