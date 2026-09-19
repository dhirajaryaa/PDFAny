"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { rangePdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

export default function RangeTool({ meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  const total = pageCount ?? 0;
  const synced = start > end;

  async function doRange() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const out = await rangePdf(file, { start: Math.min(start, end), end: Math.max(start, end) });
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  const count = Math.abs(end - start) + 1;

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

      {file && total > 0 ? (
        <>
          <section className="space-y-3">
            <SectionHeading step={2} title="Pick the range" />
            <div className="flex max-w-md flex-wrap items-end gap-4">
              <label className="space-y-1.5">
                <span className="text-[13px] font-medium">From page</span>
                <input
                  type="number"
                  min={1}
                  max={total}
                  value={start}
                  onChange={(e) => setStart(parseInt(e.target.value, 10) || 1)}
                  className="h-11 w-28 rounded-lg border border-border bg-surface px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[13px] font-medium">To page</span>
                <input
                  type="number"
                  min={1}
                  max={total}
                  value={end}
                  onChange={(e) => setEnd(parseInt(e.target.value, 10) || 1)}
                  className="h-11 w-28 rounded-lg border border-border bg-surface px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <p className="text-[13px] text-muted">
                {start > end ? "Works in reverse too" : ""} · {count} page{count === 1 ? "" : "s"}
              </p>
            </div>
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" disabled={synced === false && count === 0} onClick={doRange} loading={busy}>
              {busy ? "Exporting…" : "Export range"}
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