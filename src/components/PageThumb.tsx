"use client";

import { useEffect, useRef, useState } from "react";
import { getPageThumbnail } from "@/lib/pdfjs";

interface Props {
  file: File;
  pageIndex: number; // 0-based
  maxWidth?: number;
  className?: string;
}

export function PageThumb({ file, pageIndex, maxWidth = 460, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    let alive = true;
    getPageThumbnail(file, pageIndex + 1, maxWidth)
      .then((u) => {
        if (alive) setUrl(u);
      })
      .catch(() => {
        if (alive) setUrl(null);
      });
    return () => {
      alive = false;
    };
  }, [visible, file, pageIndex, maxWidth]);

  return (
    <div ref={ref} className={`relative aspect-[3/4] w-full overflow-hidden bg-surface-muted ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Page ${pageIndex + 1}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="animate-pulse text-xs text-muted-2">…</span>
        </div>
      )}
    </div>
  );
}