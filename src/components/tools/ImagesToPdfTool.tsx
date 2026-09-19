"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { formatBytes, imagesToPdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";

interface ImgItem {
  file: File;
  url: string;
}

export default function ImagesToPdfTool({ meta: _meta }: { meta: ToolMeta }) {
  const [items, setItems] = useState<ImgItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  function addFiles(files: File[]) {
    setError(null);
    setResult(null);
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  }

  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function remove(i: number) {
    setItems((prev) => {
      const next = [...prev];
      const [removed] = next.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  async function convert() {
    if (items.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const out = await imagesToPdf(items.map((i) => i.file));
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <ResultPanel
        files={result}
        onReset={() => {
          items.forEach((i) => URL.revokeObjectURL(i.url));
          setItems([]);
          setResult(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading step={1} title="Add images" hint="JPG, PNG or WebP — one image per page" />
        <FileDropzone
          accept="image/jpeg,image/png,image/webp"
          label="images"
          multiple
          caption="One image becomes one page. Order below = page order."
          onFiles={addFiles}
        />
      </section>

      {items.length > 0 ? (
        <section className="space-y-3">
          <SectionHeading step={2} title="Order images" />
          <Card className="divide-y divide-border">
            {items.map((it, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.file.name}</p>
                  <p className="text-xs text-muted">{formatBytes(it.file.size)}</p>
                </div>
                <button
                  aria-label="Move up"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  aria-label="Move down"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  aria-label="Remove"
                  onClick={() => remove(i)}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      {error ? <p className="text-[13px] text-danger">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button size="lg" disabled={items.length === 0} onClick={convert} loading={busy}>
          {busy ? "Converting…" : `Create PDF (${items.length} image${items.length === 1 ? "" : "s"})`}
        </Button>
      </div>
    </div>
  );
}