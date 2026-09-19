"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { PageGrid } from "@/components/PageGrid";
import { ResultPanel } from "@/components/Result";
import { reorderPdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

export default function ReorderTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [order, setOrder] = useState<number[]>([]);
  const [orderKey, setOrderKey] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  const count = pageCount ?? 0;

  const fileKey = `${file?.name ?? ""}:${file?.lastModified ?? 0}`;
  if (fileKey && orderKey !== fileKey && pageCount !== null) {
    setOrderKey(fileKey);
    setOrder(Array.from({ length: pageCount }, (_, i) => i));
  }

  function move(pos: number, dir: -1 | 1) {
    setOrder((prev) => {
      const next = [...prev];
      const j = pos + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[pos], next[j]] = [next[j], next[pos]];
      return next;
    });
  }

  const isIdentity = count > 0 && order.every((v, i) => v === i);

  async function doReorder() {
    if (!file || order.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const out = await reorderPdf(file, order);
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed.");
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
                setOrder([]);
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
              <SectionHeading step={2} title="Drag pages into position" hint="or use the arrows" />
              <Button variant="outline" size="sm" onClick={() => setOrder(Array.from({ length: count }, (_, i) => i))}>
                Reset order
              </Button>
            </div>
            <PageGrid
              file={file}
              order={order}
              mode="reorder"
              onReorder={setOrder}
              badge={(idx) => (
                <span className="ml-1 flex h-5 items-center gap-0.5 rounded-md bg-surface/90">
                  <button
                    aria-label={`Move page ${idx + 1} left`}
                    onClick={(e) => {
                      e.stopPropagation();
                      move(order.indexOf(idx), -1);
                    }}
                    className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-foreground"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    aria-label={`Move page ${idx + 1} right`}
                    onClick={(e) => {
                      e.stopPropagation();
                      move(order.indexOf(idx), 1);
                    }}
                    className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-foreground"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </span>
              )}
            />
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" disabled={isIdentity || busy} onClick={doReorder} loading={busy}>
              {busy ? "Reordering…" : "Apply new order"}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          onReset={() => {
            setResult(null);
            setOrder([]);
            reset();
          }}
        />
      ) : null}
    </div>
  );
}