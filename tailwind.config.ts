import type { Config } from "tailwindcss";

// Dennis Cars design system — dark charcoal + olive-green accent.
// Tokens are exposed as Tailwind colors so components read semantic names
// (bg-surface, text-accent) rather than raw hex.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base: "#0E0F12", // page background (near-black charcoal, not pure #000)
        surface: "#16181D", // cards / raised panels
        "surface-2": "#1E2128", // inputs, nested surfaces
        // Text
        ink: "#F5F6F7", // primary text
        "ink-muted": "#9BA1AD", // secondary / muted text
        "ink-faint": "#6B7280", // hints, disabled
        // Accent (olive green). `hover` is the lightest tint of the base that
        // still clears 4.5:1 against white, because .btn-primary puts white
        // labels on bg-accent-hover.
        accent: {
          DEFAULT: "#60761D",
          hover: "#687F1F",
          soft: "#2F3816", // tinted background for accent chips on dark
        },
        // Borders
        line: "#2A2E37",
        "line-strong": "#3A3F4A",
        // Status
        ok: "#16A34A",
        reserved: "#D97706",
        sold: "#6B7280",
        // Back-compat alias so the admin panel (internal tool, kept on its
        // light theme) inherits the same accent + dark tokens for consistency,
        // without a redesign pass.
        brand: {
          DEFAULT: "#60761D",
          light: "#687F1F",
          dark: "#0E0F12",
        },
      },
      fontFamily: {
        // Wired to next/font CSS variables (see app/layout.tsx).
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "9px",
        card: "12px",
      },
      spacing: {
        // Consistent rhythm used for section padding.
        "18": "4.5rem",
      },
      maxWidth: {
        content: "72rem", // 1152px main container
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        tick: {
          "0%": { opacity: "0.2", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        heartbeat: {
          "0%, 40%, 100%": { transform: "scale(1)" },
          "10%": { transform: "scale(1.28)" },
          "20%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.14)" },
        },
        "heart-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.5" },
          "80%, 100%": { transform: "scale(1.9)", opacity: "0" },
        },
      },
      animation: {
        "fade-rise": "fade-rise 0.5s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        tick: "tick 0.3s ease-out",
        heartbeat: "heartbeat 1.8s cubic-bezier(0.22,1,0.36,1) infinite",
        "heart-ring": "heart-ring 1.8s cubic-bezier(0.22,1,0.36,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
