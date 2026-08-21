// Text-based recreation of the TBI Bank wordmark (no external asset — same
// approach as our own Logo component). Swap for the official SVG if/when
// TBI Bank supplies brand assets.
export default function TbiBankBadge({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = {
    sm: "h-6 w-6 rounded-[7px] text-xs",
    md: "h-8 w-8 rounded-[9px] text-sm",
    lg: "h-11 w-11 rounded-xl text-base",
  }[size];
  const bank = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];
  const gap = size === "lg" ? "gap-2.5" : "gap-1.5";

  return (
    <span
      className={`inline-flex items-center ${gap} ${className}`}
      aria-label="TBI Bank"
    >
      <span
        className={`flex shrink-0 items-center justify-center bg-[#FF6A13] font-display font-extrabold lowercase leading-none text-black ${box}`}
      >
        tbi
      </span>
      <span
        className={`font-display font-semibold lowercase leading-none text-[#FF6A13] ${bank}`}
      >
        bank
      </span>
    </span>
  );
}
