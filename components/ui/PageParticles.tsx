import Particles from "./Particles";

// One mote field behind the whole site, mounted once in the locale layout.
//
// Fixed rather than absolute, so the motes drift over every section of every
// route instead of stopping at a section boundary — the per-section fields
// (hero, consignment strip, CTA panel, footer) then layer on top of this one
// where extra density is wanted. `z-0` keeps it under the app, which sits in
// its own `relative z-10` wrapper.
export default function PageParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <Particles count={44} seed={101} className="text-accent-hover" intensity={1.1} />
    </div>
  );
}
