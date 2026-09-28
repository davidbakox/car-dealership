"use client";

// Any error inside the admin lands here instead of Next's bare
// "Application error: a client-side exception" screen. The sidebar/header
// stays, so the admin can navigate away or retry.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">Hiba történt</h1>
      <p className="mt-2 text-sm text-slate-600">
        Valami nem sikerült az oldal betöltésekor. Próbáld újra; ha nem
        segít, töltsd újra az oldalt.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-slate-400">Kód: {error.digest}</p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-light"
        >
          Újra
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          Oldal újratöltése
        </button>
      </div>
    </div>
  );
}
