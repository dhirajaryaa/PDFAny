"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { watermarkPdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

const SUGGESTIONS = ["DRAFT", "CONFIDENTIAL", "ORIGINAL", "COPY"];

export default function WatermarkTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [text, setText] = useState("DRAFT");
  const [opacity, setOpacity] = useState(0.18);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  async function doWatermark() {
    if (!file || !text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const out = await watermarkPdf(file, { text: text.trim(), opacity });
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Watermark failed.");
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
              <p className="text-xs text-muted">
                {pageCount ? `${pageCount} pages` : "Reading pages…"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              Change file
            </Button>
          </Card>
        )}
      </section>

      {file && pageCount ? (
        <>
          <section className="space-y-4">
            <SectionHeading step={2} title="Watermark text" />
            <div className="flex max-w-md flex-wrap items-end gap-4">
              <label className="flex-1 space-y-1.5">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. CONFIDENTIAL"
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm font-medium outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-accent"
                />
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setText(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)])}
              >
                Suggest
              </Button>
            </div>
            <div className="flex max-w-md flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setText(s)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <span className="text-[13px] font-medium">Opacity — {Math.round(opacity * 100)}%</span>
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.01}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-64 accent-accent"
              />
            </div>
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" disabled={!text.trim()} onClick={doWatermark} loading={busy}>
              {busy ? "Watermarking…" : "Add watermark"}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          onReset={() => {
            setResult(null);
            reset();
          }}
        />
      ) : null}
    </div>
  );
}