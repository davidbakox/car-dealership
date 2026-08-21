import Particles from "./Particles";

// Page-wide atmosphere, mounted once in the locale layout and fixed behind
// every route: three slow olive light pools, a sparse mote field, and a film
// grain over the top.
//
// The point is to kill the "flat dark rectangle" feel without putting anything
// in front of the content — the whole layer is fixed, `pointer-events: none`,
// and sits below the app's own z-index stack. Nothing here animates a property
// that triggers layout or repaint: the pools only move with `transform`, and
// the grain is a static tile.
export default function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient-pool ambient-pool--1" />
      <span className="ambient-pool ambient-pool--2" />
      <span className="ambient-pool ambient-pool--3" />
      <Particles count={26} seed={101} className="text-accent-hover" intensity={0.9} />
      <span className="ambient-grain" />
    </div>
  );
}
