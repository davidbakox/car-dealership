"use client";

import { useCallback, useRef, useState } from "react";
import { t } from "@/lib/i18n/config";
import { MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES } from "@/lib/env";

interface Props {
  /** Initial ordered image URLs (edit mode). */
  initial?: string[];
  /** Hidden input name the parent <form> submits (JSON string of URLs). */
  name?: string;
}

// Compresses each image to a web-friendly WebP, then uploads it through an
// authenticated server endpoint. R2 credentials never reach the browser.
// Drag-to-reorder is native HTML5 DnD; the ordered URLs are serialised into a
// hidden input so the server action receives display order directly.
export default function ImageUploader({ initial = [], name = "images" }: Props) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragFrom = useRef<number | null>(null);
  const upload = useCallback(
    async (files: FileList) => {
      setError(null);
      setBusy(true);
      const uploaded: string[] = [];
      try {
        for (const file of Array.from(files)) {
          if (!ALLOWED_IMAGE_TYPES.includes(file.type as never)) {
            setError(`Unsupported type: ${file.name}`);
            continue;
          }
          if (file.size > MAX_IMAGE_BYTES) {
            setError(`Too large (max 20 MB): ${file.name}`);
            continue;
          }

          const optimized = await optimizeImage(file);
          const body = new FormData();
          body.set("file", optimized);
          const response = await fetch("/api/admin/images", {
            method: "POST",
            body,
          });
          const result = (await response.json()) as {
            url?: string;
            error?: string;
          };
          if (!response.ok || !result.url) {
            setError(result.error ?? `Upload failed: ${file.name}`);
            continue;
          }
          uploaded.push(result.url);
        }
        setUrls((prev) => [...prev, ...uploaded]);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    []
  );

  function removeAt(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function onDrop(to: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from === null || from === to) return;
    setUrls((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />

      <div className="flex flex-wrap gap-3">
        {urls.map((url, i) => (
          <div
            key={url}
            draggable
            onDragStart={() => (dragFrom.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="group relative h-24 w-32 cursor-move overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
            title="Drag to reorder"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 hidden rounded bg-black/60 px-1.5 py-0.5 text-xs text-white group-hover:block"
            >
              ✕
            </button>
          </div>
        ))}

        <label className="flex h-24 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-brand hover:text-brand">
          {busy ? "…" : "+ Add"}
          <input
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            multiple
            className="hidden"
            disabled={busy}
            onChange={(e) => e.target.files && upload(e.target.files)}
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-slate-500">{t.admin_upload_hint}</p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

async function optimizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 2000;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Your browser could not process this image");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82)
  );
  if (!blob) throw new Error("Image compression failed");

  const baseName = file.name.replace(/\.[^.]+$/, "") || "car";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}
