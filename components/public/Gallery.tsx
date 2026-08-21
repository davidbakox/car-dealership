"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// Swipeable image gallery. The main viewport is a horizontal scroll-snap track
// (native touch swipe on mobile, arrow buttons on desktop). Thumbnails scroll
// the track to the chosen image. No hover dependency.
export default function Gallery({
  images,
  alt,
  overlay,
}: {
  images: string[];
  alt: string;
  /** Badges drawn over the main image (status, photo count, location). */
  overlay?: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-card border border-line bg-surface text-ink-faint">
        —
      </div>
    );
  }

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActive(clamped);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-card border border-line bg-base [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/3] w-full shrink-0 snap-center"
            >
              <Image
                src={src}
                alt={`${alt} — ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {overlay && (
          <div className="pointer-events-none absolute inset-0">{overlay}</div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-base/70 text-ink backdrop-blur transition hover:bg-base sm:flex"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-base/70 text-ink backdrop-blur transition hover:bg-base sm:flex"
              aria-label="Next"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-5 bg-accent" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded border-2 transition ${
                i === active ? "border-accent" : "border-transparent opacity-70"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
