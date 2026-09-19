"use client";

import { useMemo, useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { PageGrid } from "@/components/PageGrid";
import { ResultPanel } from "@/components/Result";
import { extractPdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

export default function ExtractTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  const count = pageCount ?? 0;
  const all = useMemo(() => new Set(Array.from({ length: count }, (_, i) => i)), [count]);

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function changeFile(files: File[]) {
    load(files);
    setSelected(new Set());
  }

  async function doExtract() {
    if (!file || selected.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const out = await extractPdf(file, [...selected].sort((a, b) => a - b));
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extract failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading step={1} title="Upload a PDF" />
        {!file ? (
          <FileDropzone accept="application/pdf,.pdf" label="PDF" multiple={false} onFiles={changeFile} />
        ) : (
          <Card className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted">
                {pageCount ? `${pageCount} pages` : "Reading pages…"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
                setSelected(new Set());
              }}
            >
              Change file
            </Button>
          </Card>
        )}
      </section>

      {file && count > 0 ? (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeading step={2} title="Select pages to keep" hint={`${selected.size} selected`} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelected(all)}>
                  Select all
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
            <PageGrid file={file} order={Array.from({ length: count }, (_, i) => i)} mode="select" selected={selected} onToggle={toggle} />
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" disabled={selected.size === 0} onClick={doExtract} loading={busy}>
              {busy ? "Extracting…" : `Extract ${selected.size} page${selected.size === 1 ? "" : "s"}`}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          onReset={() => {
            setResult(null);
            setSelected(new Set());
            reset();
          }}
        />
      ) : null}
    </div>
  );
}