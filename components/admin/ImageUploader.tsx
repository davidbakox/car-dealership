"use client";

import { useRef, useState } from "react";
import { t } from "@/lib/i18n/config";
import { MAX_IMAGE_BYTES } from "@/lib/env";

interface Props {
  /** Initial ordered image URLs (edit mode). */
  initial?: string[];
  /** Hidden input name the parent <form> submits (JSON string of URLs). */
  name?: string;
}

// Shrinks each photo in the browser, then uploads it through an authenticated
// server endpoint. R2 credentials never reach the browser. The ordered URLs are
// serialised into a hidden input so the server action receives display order
// directly.
//
// Built for a phone as much as a desktop: the picker accepts anything the
// camera roll hands over, every control is a tap target (no hover-only
// buttons, no drag-and-drop required), and files go up one at a time with a
// visible counter so a slow mobile connection never looks frozen.
export default function ImageUploader({ initial = [], name = "images" }: Props) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [errors, setErrors] = useState<string[]>([]);
  const dragFrom = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = progress !== null;

  async function upload(fileList: FileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setErrors([]);
    setProgress({ done: 0, total: files.length });
    const failed: string[] = [];

    for (const [i, file] of files.entries()) {
      try {
        if (file.type && !file.type.startsWith("image/")) {
          throw new Error("ez nem kép");
        }
        if (file.size > MAX_IMAGE_BYTES) {
          throw new Error("túl nagy (max. 50 MB)");
        }
        const optimized = await optimizeImage(file);
        const body = new FormData();
        body.set("file", optimized);
        const response = await fetch("/api/admin/images", {
          method: "POST",
          body,
        });
        // A Cloudflare error page is HTML, not JSON — read it defensively.
        const result = (await response.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };
        if (response.status === 401) {
          throw new Error("lejárt a bejelentkezés, lépj be újra");
        }
        if (!response.ok || !result.url) {
          throw new Error(result.error ?? `szerverhiba (${response.status})`);
        }
        // Appended one by one, so a failure halfway keeps what already went up.
        setUrls((prev) => [...prev, result.url!]);
      } catch (cause) {
        const reason =
          cause instanceof Error && cause.message ? cause.message : "sikertelen";
        failed.push(`${file.name || `${i + 1}. kép`}: ${reason}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }

    setErrors(failed);
    setProgress(null);
    // Let the same photo be picked again after a failure.
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function move(from: number, to: number) {
    if (from === to || to < 0) return;
    setUrls((prev) => {
      if (to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function onDrop(to: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from !== null) move(from, to);
  }

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-sm text-white backdrop-blur transition hover:bg-black/80 disabled:opacity-30";

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {urls.map((url, i) => (
          <div
            key={url}
            draggable
            onDragStart={() => (dragFrom.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:cursor-move"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
            {i === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded bg-brand px-2 py-1 text-[11px] font-medium text-white">
                Borítókép
              </span>
            ) : (
              <button
                type="button"
                onClick={() => move(i, 0)}
                className="absolute left-1.5 top-1.5 rounded bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black/80"
              >
                Legyen borító
              </button>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Kép törlése"
              className={`${iconBtn} absolute right-1.5 top-1.5 hover:bg-red-600`}
            >
              ✕
            </button>
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Előrébb"
                className={iconBtn}
              >
                ←
              </button>
              <span className="self-center rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === urls.length - 1}
                aria-label="Hátrébb"
                className={iconBtn}
              >
                →
              </button>
            </div>
          </div>
        ))}

        <label
          className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-2 text-center text-sm transition ${
            busy
              ? "border-brand bg-brand/5 text-brand"
              : "border-slate-300 text-slate-500 hover:border-brand hover:text-brand"
          }`}
        >
          {busy ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="font-medium">
                Feltöltés {progress.done}/{progress.total}
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl leading-none">+</span>
              <span className="font-medium">Fotók hozzáadása</span>
              <span className="text-xs">galéria vagy kamera</span>
            </>
          )}
          {/* image/* rather than a MIME list: iOS then hands over a JPEG copy
              of HEIC photos, and Android offers the camera as well. */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(e) => e.target.files && upload(e.target.files)}
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-slate-500">{t.admin_upload_hint}</p>
      {errors.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const MAX_DIMENSION = 2000;

// Decodes through an <img> element rather than createImageBitmap: it is the
// path every mobile browser supports, it applies the EXIF rotation of phone
// photos, and Safari decodes HEIC through it.
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("a telefon ezt a képformátumot nem tudja megnyitni"));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality)
  );
}

async function optimizeImage(file: File): Promise<File> {
  const img = await loadImage(file);
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight)
  );
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("a böngésző nem tudta feldolgozni a képet");
  context.drawImage(img, 0, 0, width, height);

  // Safari cannot encode WebP: toBlob quietly returns a PNG instead, which for
  // a photo is several MB — the old uploader labelled that PNG as WebP and the
  // server rejected it as too large, which is why phone uploads failed. Check
  // what actually came back and fall back to JPEG.
  let blob = await toBlob(canvas, "image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob(canvas, "image/jpeg", 0.85);
  }
  canvas.width = canvas.height = 0; // release the bitmap memory on iOS
  if (!blob) throw new Error("a kép tömörítése nem sikerült");

  const type = blob.type === "image/webp" ? "image/webp" : "image/jpeg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "car";
  return new File([blob], `${baseName}.${type === "image/webp" ? "webp" : "jpg"}`, {
    type,
  });
}
