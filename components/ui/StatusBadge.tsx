import type { CarStatus } from "@/lib/types";

// Availability badge. Labels are passed in (translated by the caller) so this
// stays presentation-only.
const styles: Record<CarStatus, string> = {
  available: "bg-ok/90 text-green-950",
  reserved: "bg-reserved/90 text-amber-950",
  sold: "bg-sold text-gray-900",
};

export default function StatusBadge({
  status,
  label,
  className = "",
}: {
  status: CarStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-medium ${styles[status]} ${className}`}
    >
      {label}
    </span>
  );
}
