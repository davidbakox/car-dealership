import { Poppins, Inter } from "next/font/google";

// Self-hosted at build time by next/font (no runtime external request — edge-safe).
export const display = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const sans = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const fontVars = `${display.variable} ${sans.variable}`;
