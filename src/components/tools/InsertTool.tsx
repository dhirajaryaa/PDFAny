"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { PageGrid } from "@/components/PageGrid";
import { ResultPanel } from "@/components/Result";
import {
  insertBlankPdf,
  insertFromPdf,
  type PaperSize,
} from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

const SIZES: { id: PaperSize; label: string }[] = [
  { id: "A4", label: "A4" },
  { id: "Letter", label: "Letter" },
  { id: "Legal", label: "Legal" },
  { id: "Square", label: "Square" },
];

type Source = "blank" | "pdf";

export default function InsertTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [source, setSource] = useState<Source>("blank");
  const [size, setSize] = useState<PaperSize>("A4");
  const [landscape, setLandscape] = useState(false);
  const [count, setCount] = useState(1);
  const [position, setPosition] = useState<number | null>(null);
  const [srcFile, setSrcFile] = useState<File | null>(null);
  const [srcCount, setSrcCount] = useState<number | null>(null);
  const [srcSelected, setSrcSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  const total = pageCount ?? 0;
  const pos = position ?? total;

  const fileKey = `${file?.name ?? ""}:${file?.lastModified ?? 0}`;
  const [posKey, setPosKey] = useState("");
  if (fileKey && posKey !== fileKey && pageCount !== null) {
    setPosKey(fileKey);
    setPosition(pageCount);
  }

  function onSrcFiles(files: File[]) {
    const f = files[0];
    setSrcFile(f);
    setSrcCount(null);
    setSrcSelected(new Set());
    const p = Promise.resolve(import("@/lib/pdfjs")).then(({ getPdfPageCount }) =>
      getPdfPageCount(f)
    );
    void p.then(setSrcCount);
  }

  async function doInsert() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      let out: File;
      if (source === "blank") {
        out = await insertBlankPdf(file, [{ position: pos, size, landscape }], count);
      } else {
        if (!srcFile) throw new Error("Add a source PDF to copy pages from.");
        const pages = srcSelected.size > 0 ? [...srcSelected].sort((a, b) => a - b) : undefined;
        out = await insertFromPdf(file, srcFile, pos, pages);
      }
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Insert failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading step={1} title="Upload the target PDF" />
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
                setPosition(null);
              }}
            >
              Change file
            </Button>
          </Card>
        )}
      </section>

      {file && pageCount ? (
        <>
          <section className="space-y-3">
            <SectionHeading step={2} title="Insert what?" />
            <div className="inline-flex rounded-lg border border-border bg-surface p-1">
              {(
                [
                  ["blank", "Blank pages"],
                  ["pdf", "Pages from another PDF"],
                ] as [Source, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setSource(id)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    source === id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {source === "blank" ? (
            <section className="space-y-3">
              <div className="grid gap-2 text-[13px]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium">Page size</span>
                  <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
                    {SIZES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSize(s.id)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          size === s.id
                            ? "bg-accent text-accent-foreground"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={landscape}
                      onChange={(e) => setLandscape(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-accent"
                    />
                    Landscape
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium">How many</span>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={count}
                    onChange={(e) =>
                      setCount(Math.max(1, Math.min(500, parseInt(e.target.value, 10) || 1)))
                    }
                    className="h-10 w-20 rounded-lg border border-border bg-surface px-3 text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-3">
              <FileDropzone accept="application/pdf,.pdf" label="the source PDF" multiple={false} onFiles={onSrcFiles} />
              {srcFile && srcCount ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-muted">
                    Pages will be copied from <span className="font-medium text-foreground">{srcFile.name}</span>.
                    {srcSelected.size > 0
                      ? ` Selected: ${[...srcSelected].sort((a, b) => a - b).map((p) => p + 1).join(", ")}.`
                      : " No pages selected — all pages will be inserted."}
                  </p>
                  <PageGrid
                    file={srcFile}
                    order={Array.from({ length: srcCount }, (_, i) => i)}
                    mode="select"
                    selected={srcSelected}
                    onToggle={(i) =>
                      setSrcSelected((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                  />
                </div>
              ) : null}
            </section>
          )}

          <section className="space-y-3">
            <SectionHeading step={3} title="Where to insert?" />
            <p className="text-[13px] text-muted">
              0 = at the very start · {total} = at the very end
            </p>
            <div className="flex max-w-sm items-center gap-3">
              <input
                type="number"
                min={0}
                max={Math.max(0, total)}
                value={pos}
                onChange={(e) => setPosition(parseInt(e.target.value, 10))}
                className="h-11 w-24 rounded-lg border border-border bg-surface px-3 text-center text-sm font-semibold outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-[13px] text-muted">
                {pos === 0 ? "Insert at the beginning" : pos >= total ? "Insert at the end" : `Insert after page ${pos}`}
              </span>
            </div>
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              disabled={
                !file ||
                (source === "pdf" && !srcFile) ||
                (source === "pdf" && srcCount !== null && srcSelected.size === 0 && srcCount === 0)
              }
              onClick={doInsert}
              loading={busy}
            >
              {busy ? "Inserting…" : "Insert pages"}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          onReset={() => {
            setResult(null);
            setSrcFile(null);
            setSrcSelected(new Set());
            setPosition(null);
            reset();
          }}
        />
      ) : null}
    </div>
  );
}

