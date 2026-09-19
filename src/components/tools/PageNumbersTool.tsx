"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { addPageNumbersPdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

type Position = "bottom-left" | "bottom-center" | "bottom-right" | "top-right";

const POSITIONS: { id: Position; label: string }[] = [
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-center", label: "Bottom center" },
  { id: "bottom-right", label: "Bottom right" },
  { id: "top-right", label: "Top right" },
];

export default function PageNumbersTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [start, setStart] = useState(1);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  async function doNumber() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const out = await addPageNumbersPdf(file, { start, position });
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add page numbers.");
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
            <SectionHeading step={2} title="Numbering" />
            <div className="flex max-w-md flex-wrap items-end gap-4">
              <label className="space-y-1.5">
                <span className="text-[13px] font-medium">Start at</span>
                <input
                  type="number"
                  min={0}
                  value={start}
                  onChange={(e) => setStart(parseInt(e.target.value, 10) || 1)}
                  className="h-11 w-28 rounded-lg border border-border bg-surface px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <div className="inline-flex rounded-lg border border-border bg-surface p-1">
                {POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPosition(p.id)}
                    className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      position === p.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[13px] text-muted">
              Pages are numbered {start} → {start + (pageCount ?? 0) - 1}.
            </p>
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" onClick={doNumber} loading={busy}>
              {busy ? "Numbering…" : "Add page numbers"}
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