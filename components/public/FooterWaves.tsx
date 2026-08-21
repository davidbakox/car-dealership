// Animated wave band that forms the top edge of the footer.
//
// Four layers slide at different speeds and in opposite directions, which
// reads as parallax without any JavaScript — each layer is one SVG twice the
// container's width, translated by exactly half of itself, so the loop is
// seamless. The frontmost wave is filled with the footer's own surface colour,
// so it *is* the footer's top edge rather than a decoration sitting on it, and
// a stroked copy of that same curve rides on top to give the edge a crisp
// accent line (surface-on-base alone is too low-contrast to read as a wave).
//
// Every path repeats with a period of 300 user units across a 1200-unit
// viewBox: four identical periods, so shifting by 600 (half the SVG) always
// lands on a matching phase. Changing a path means keeping that period intact,
// otherwise the loop visibly jumps.
const CREST_BACK = "M0,32 q75,-36 150,0 t150,0 t150,0 t150,0 t150,0 t150,0 t150,0 t150,0";
const CREST_MID = "M0,52 q75,32 150,0 t150,0 t150,0 t150,0 t150,0 t150,0 t150,0 t150,0";
const CREST_FRONT = "M0,64 q75,-28 150,0 t150,0 t150,0 t150,0 t150,0 t150,0 t150,0 t150,0";

/** Closes an open crest into a filled band down to the bottom of the viewBox. */
const filled = (crest: string) => `${crest} L1200,100 L0,100 Z`;

const LAYERS = [
  { d: filled(CREST_BACK), className: "footer-wave--back" },
  { d: filled(CREST_MID), className: "footer-wave--mid" },
  { d: filled(CREST_FRONT), className: "footer-wave--front" },
  // Open path, stroked not filled — same phase and speed as the front wave.
  { d: CREST_FRONT, className: "footer-wave--line" },
];

export default function FooterWaves() {
  return (
    <div className="footer-waves" aria-hidden="true">
      {LAYERS.map((layer) => (
        <svg
          key={layer.className}
          className={`footer-wave ${layer.className}`}
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <path d={layer.d} />
        </svg>
      ))}
    </div>
  );
}
