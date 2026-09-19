"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { reversePdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

export default function ReverseTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  async function doReverse() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const out = await reversePdf(file);
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reverse failed.");
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
          {error ? <p className="text-[13px] text-danger">{error}</p> : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button size="lg" onClick={doReverse} loading={busy}>
              {busy ? "Reversing…" : "Reverse page order"}
            </Button>
            <p className="text-[13px] text-muted">
              The last page becomes the first, and so on ({pageCount} pages).
            </p>
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