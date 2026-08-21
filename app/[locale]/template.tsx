"use client";

import RouteTransition from "@/components/ui/RouteTransition";

// Next.js remounts template.tsx on every navigation (unlike layout.tsx, which
// persists), so this is what makes the route-fade actually replay per click —
// giving instant visual feedback that a nav click registered, instead of the
// page sitting silent while the next route's data loads.
export default function Template({ children }: { children: React.ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
