// Written-out wordmark: "DENNIS CARS CAREI" in the display font.
// Deliberately text-based (no image): crisp at every size, zero loading state,
// and immune to the broken-image flash an <img> fallback can produce.
export default function Logo({
  size = "md",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const scale =
    size === "lg"
      ? "text-xl sm:text-2xl tracking-[0.08em]"
      : "text-lg sm:text-xl tracking-[0.08em]";
  return (
    <span
      className={`inline-flex items-baseline gap-2 font-display font-semibold uppercase leading-none ${scale} ${className}`}
      aria-label="Dennis Cars Carei"
    >
      <span className="text-ink">
        Dennis&nbsp;<span className="text-accent">Cars</span>
      </span>
      <span className="text-[0.55em] font-medium tracking-[0.35em] text-ink-muted">
        Carei
      </span>
    </span>
  );
}
