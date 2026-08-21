"use client";

import { motion, useReducedMotion } from "framer-motion";

// Headline that arrives word by word, out of step.
//
// The delays carry a deterministic jitter instead of a fixed step, because an
// even cadence reads as a machine typing; an uneven one reads as writing. Words
// stay real words in the DOM (one span each, separated by real spaces), so
// selection, search and screen readers are unaffected.
//
// `highlightLast` puts the shimmer sweep on the final words — the phrase a
// headline usually lands on.
const jitter = (i: number) => {
  const v = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return v - Math.floor(v); // 0…1, stable for a given index
};

export default function SplitWords({
  text,
  className = "",
  delay = 0,
  highlightLast = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  /** Seconds to wait before the first word. */
  delay?: number;
  /** How many trailing words get the accent shimmer. */
  highlightLast?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const firstHighlighted = words.length - highlightLast;

  if (reduce) {
    return (
      <Tag className={className}>
        {words.map((word, i) => (
          <span key={i} className={i >= firstHighlighted ? "text-shimmer" : undefined}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => {
        const j = jitter(i);
        return (
          <motion.span
            key={i}
            // inline-block is what makes the per-word transform possible; the
            // trailing space is kept outside it so the line still wraps and
            // copies as normal text.
            className={`inline-block ${i >= firstHighlighted ? "text-shimmer" : ""}`}
            initial={{ opacity: 0, y: 18 + j * 14, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.6 + j * 0.35,
              delay: delay + i * 0.075 + j * 0.09,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        );
      }).reduce<React.ReactNode[]>((out, node, i) => {
        if (i > 0) out.push(" ");
        out.push(node);
        return out;
      }, [])}
    </Tag>
  );
}
