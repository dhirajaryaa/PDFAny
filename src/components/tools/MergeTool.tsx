"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { formatBytes, mergePdfs } from "@/lib/pdf";
import { getPdfPageCount } from "@/lib/pdfjs";
import type { ToolMeta } from "@/lib/tools";

interface DocItem {
  file: File;
  pages: number | null;
}

export default function MergeTool({ meta }: { meta: ToolMeta }) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  const addFiles = useCallback((files: File[]) => {
    setResult(null);
    setError(null);
    const items: DocItem[] = files.map((file) => ({ file, pages: null }));
    setDocs((prev) => [...prev, ...items]);
  }, []);

  useEffect(() => {
    for (const item of docs) {
      if (item.pages !== null) continue;
      getPdfPageCount(item.file)
        .then((n) =>
          setDocs((prev) =>
            prev.map((d) => (d.file === item.file ? { ...d, pages: n } : d))
          )
        )
        .catch(() =>
          setDocs((prev) =>
            prev.map((d) => (d.file === item.file ? { ...d, pages: 0 } : d))
          )
        );
    }
  }, [docs]);

  function move(i: number, dir: -1 | 1) {
    setDocs((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function remove(i: number) {
    setDocs((prev) => prev.filter((_, k) => k !== i));
  }

  async function doMerge() {
    setBusy(true);
    setError(null);
    try {
      const out = await mergePdfs(docs.map((d) => d.file));
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <ResultPanel
        files={result}
        onReset={() => {
          setDocs([]);
          setResult(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading step={1} title="Add your PDFs" hint="Order below = order in the merged file" />
        <FileDropzone accept="application/pdf,.pdf" label="PDFs" multiple onFiles={addFiles} />
      </section>

      {docs.length > 0 ? (
        <section className="space-y-3">
          <SectionHeading step={2} title="Arrange documents" />
          <Card className="divide-y divide-border">
            {docs.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-accent-soft px-1 text-xs font-bold text-accent">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={d.file.name}>
                    {d.file.name}
                  </p>
                  <p className="text-xs text-muted">
                    {formatBytes(d.file.size)}
                    {d.pages !== null && d.pages > 0
                      ? ` · ${d.pages} page${d.pages === 1 ? "" : "s"}`
                      : d.pages === 0
                        ? " · unreadable"
                        : ""}
                  </p>
                </div>
                <GripVertical className="hidden h-4 w-4 text-muted-2 sm:block" />
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
                  disabled={i === docs.length - 1}
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
        <Button size="lg" disabled={docs.length < 2} onClick={doMerge} loading={busy}>
          {busy ? "Merging…" : `Merge ${docs.length}`}
        </Button>
        {docs.length > 0 ? (
          <Button variant="ghost" onClick={() => setDocs([])}>
            Clear all
          </Button>
        ) : null}
      </div>
    </div>
  );
}