import { COLOR_SWATCHES } from "@/lib/types";

// A dot filled with the car's actual paint colour. No hooks, so it works in
// both the server-rendered public pages and the client-side admin form.
// "other" (and any unknown key) falls back to a rainbow, since there is no one
// fill that could honestly stand for it.
//
// The double ring — dark outside, light inside — keeps the dot visible on the
// admin's white panels *and* on the public site's near-black surfaces, which a
// single border colour cannot do.
export default function ColorSwatch({
  color,
  size = 16,
  className = "",
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  const fill = COLOR_SWATCHES[color];
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background:
          fill ??
          "conic-gradient(from 210deg, #dc2626, #eab308, #15803d, #1d4ed8, #7c3aed, #dc2626)",
        boxShadow:
          "0 0 0 1px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.35)",
      }}
    />
  );
}
