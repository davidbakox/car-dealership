// Decorative car-outline graphic for the hero's visual panel. Pure inline SVG
// (no external asset dependency), tinted with the accent color at low opacity
// plus a solid accent underline — gives the hero a focal point beyond text.
export default function CarSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="200" cy="190" rx="170" ry="14" className="fill-black/40" />
      <path
        d="M40 150 L60 100 Q75 70 110 65 L150 60 Q170 40 210 40 L250 40 Q280 40 300 65 L330 70 Q360 75 370 100 L380 150 Z"
        className="fill-accent/15 stroke-accent"
        strokeWidth="2.5"
      />
      <path
        d="M120 70 L150 42 Q168 30 200 30 L235 30 Q262 30 280 45 L305 70 Z"
        className="fill-accent/25 stroke-accent"
        strokeWidth="2"
      />
      <circle cx="120" cy="155" r="30" className="fill-surface stroke-accent" strokeWidth="3" />
      <circle cx="120" cy="155" r="12" className="fill-accent" />
      <circle cx="300" cy="155" r="30" className="fill-surface stroke-accent" strokeWidth="3" />
      <circle cx="300" cy="155" r="12" className="fill-accent" />
      <rect x="150" y="45" width="34" height="20" rx="2" className="fill-ink/10" />
      <rect x="220" y="45" width="60" height="20" rx="2" className="fill-ink/10" />
    </svg>
  );
}
