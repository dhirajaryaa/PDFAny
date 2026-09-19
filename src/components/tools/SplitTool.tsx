"use client";

import { useMemo, useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading, Badge } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import {
  isAllRange,
  parseRanges,
  splitPerPage,
  splitRanges,
  type Range,
} from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

type Mode = "pages" | "ranges";

export default function SplitTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [mode, setMode] = useState<Mode>("pages");
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<Range[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<File[] | null>(null);

  const pageCountSafe = pageCount ?? 0;

  function toggleMode(m: Mode) {
    setMode(m);
    setParsed(null);
    setParseError(null);
  }

  function tryParse() {
    if (!pageCount) return;
    setParseError(null);
    try {
      const ranges = parseRanges(input, pageCount);
      setParsed(ranges);
    } catch (e) {
      setParsed(null);
      setParseError(e instanceof Error ? e.message : "Invalid ranges.");
    }
  }

  const segments = useMemo(() => {
    if (mode === "pages" && pageCount) {
      return pageCount;
    }
    if (mode === "ranges" && parsed && pageCount) {
      return parsed.reduce((s, r) => s + (r.end - r.start + 1), 0);
    }
    return 0;
  }, [mode, pageCount, parsed]);

  async function doSplit() {
    if (!file || !pageCount || busy) return;
    setBusy(true);
    try {
      let files: File[];
      if (mode === "pages") {
        files = await splitPerPage(file);
      } else {
        if (!parsed) tryParse();
        const ranges = parsed ?? parseRanges(input, pageCount);
        files = await splitRanges(file, ranges);
      }
      setResult(files);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Split failed.");
    } finally {
      setBusy(false);
    }
  }

  const validRangesInput = parsed !== null && !isAllRange(parsed, pageCountSafe);

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
          <section className="space-y-3">
            <SectionHeading step={2} title="Choose how to split" />
            <div className="inline-flex rounded-lg border border-border bg-surface p-1">
              {(
                [
                  ["pages", "Every page → separate file"],
                  ["ranges", "Custom ranges"],
                ] as [Mode, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => toggleMode(id)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    mode === id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {mode === "pages" ? (
            <p className="text-[13px] text-muted">
              This produces {pageCount} PDF{pageCount === 1 ? "" : "s"} — one per page — downloaded
              as a ZIP archive.
            </p>
          ) : (
            <section className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="flex-1 space-y-1.5">
                  <span className="text-[13px] font-medium">Page ranges</span>
                  <input
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setParsed(null);
                    }}
                    placeholder={`e.g. 1-3, 5, 8-${pageCount}`}
                    className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm outline-none transition-shadow placeholder:text-muted-2 focus:ring-2 focus:ring-accent"
                  />
                </label>
                <Button variant="outline" onClick={tryParse}>
                  Preview
                </Button>
              </div>
              {parseError ? <p className="text-[13px] text-danger">{parseError}</p> : null}
              {parsed ? (
                <div className="flex flex-wrap gap-2">
                  {parsed.map((r, i) => (
                    <Badge key={i}>
                      Page{r.start === r.end ? "" : "s"} {r.start}
                      {r.end > r.start ? `–${r.end}` : ""}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </section>
          )}

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              disabled={
                mode === "ranges" && (parseError !== null || parsed === null || segments === 0)
              }
              onClick={doSplit}
              loading={busy}
            >
              {busy ? "Splitting…" : `Split into ${segments} page${segments === 1 ? "" : "s"}`}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          zipName="split.zip"
          onReset={() => {
            setResult(null);
            reset();
          }}
        />
      ) : null}

      {mode === "ranges" ? (validRangesInput ? null : null) : null}
    </div>
  );
}