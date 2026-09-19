"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { downloadFilesAsZip, ResultPanel } from "@/components/Result";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";
import { exportPdfPageAsJpeg } from "@/lib/pdfjs";

export default function PdfToImagesTool({ meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  const total = pageCount ?? 0;

  const SCALES = [
    { id: 1.5, label: "Standard" },
    { id: 2, label: "High (2×)" },
    { id: 3, label: "Max (3×)" },
  ];

  async function convert() {
    if (!file || total === 0) return;
    setBusy(true);
    setError(null);
    try {
      const files: File[] = [];
      for (let i = 1; i <= total; i++) {
        const blob = await exportPdfPageAsJpeg(file, i, scale, quality);
        const padded = String(i).padStart(String(total).length, "0");
        files.push(new File([blob], `page-${padded}.jpg`, { type: "image/jpeg" }));
      }
      setResult(files);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading step={1} title="Upload a PDF" />
        {!file ? (
          <FileDropzone accept="application/pdf,.pdf" label="PDF" multiple={false} onFiles={load} />
        ) : (
          <Card className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted">{total ? `${total} pages` : "Reading pages…"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              Change file
            </Button>
          </Card>
        )}
      </section>

      {file && total > 0 ? (
        <>
          <section className="space-y-3">
            <SectionHeading step={2} title="Quality" />
            <div className="inline-flex rounded-lg border border-border bg-surface p-1">
              {SCALES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScale(s.id)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    scale === s.id ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <label className="flex max-w-xs items-center gap-3 text-[13px] text-muted">
              JPG quality
              <input
                type="range"
                min={0.5}
                max={1}
                step={0.02}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-40 accent-accent"
              />
              <span className="font-medium text-foreground">{Math.round(quality * 100)}%</span>
            </label>
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" onClick={convert} loading={busy}>
              {busy ? `Rendering ${total} pages…` : `Convert ${total} page${total === 1 ? "" : "s"} to JPG`}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          zipName="pages.zip"
          onReset={() => {
            setResult(null);
            reset();
          }}
        />
      ) : null}
    </div>
  );
}