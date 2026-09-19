"use client";

import { useMemo, useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { PageGrid } from "@/components/PageGrid";
import { ResultPanel } from "@/components/Result";
import { deletePdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

export default function DeleteTool({ meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  const count = pageCount ?? 0;
  const all = useMemo(() => new Set(Array.from({ length: count }, (_, i) => i)), [count]);
  const remaining = count - marked.size;

  function toggle(i: number) {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function changeFile(files: File[]) {
    load(files);
    setMarked(new Set());
  }

  async function doDelete() {
    if (!file || marked.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const out = await deletePdf(file, marked);
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
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
                setMarked(new Set());
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
              <SectionHeading step={2} title="Select pages to delete" hint={`${marked.size} marked`} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setMarked(all)}>
                  Mark all
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMarked(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
            <PageGrid file={file} order={Array.from({ length: count }, (_, i) => i)} mode="select" selected={marked} onToggle={toggle} />
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant={marked.size > 0 ? "danger" : "primary"}
              disabled={marked.size === 0 || remaining === 0}
              onClick={doDelete}
              loading={busy}
            >
              {busy ? "Deleting…" : `Delete ${marked.size} page${marked.size === 1 ? "" : "s"} · ${remaining} remain`}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          onReset={() => {
            setResult(null);
            setMarked(new Set());
            reset();
          }}
        />
      ) : null}
    </div>
  );
}