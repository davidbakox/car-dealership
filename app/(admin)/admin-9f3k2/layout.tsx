// Passthrough layout for the whole admin segment. It intentionally does NOT
// guard, so the /login page (a sibling of the (protected) group) can render for
// unauthenticated users. The session guard lives in (protected)/layout.tsx.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
