"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { unlockPdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

export default function UnlockTool({ meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  async function doUnlock() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const out = await unlockPdf(file, pwd);
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wrong password, or this PDF can't be unlocked in the browser.");
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
          <section className="space-y-3">
            <SectionHeading step={2} title="Enter the password" />
            <label className="block max-w-md space-y-1.5">
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void doUnlock();
                }}
                placeholder="PDF password"
                autoComplete="off"
                className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-accent"
              />
            </label>
            <p className="text-[13px] text-muted">
              Your password is used only inside this tab to decrypt the file — nothing is ever sent anywhere.
            </p>
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" disabled={!pwd} onClick={doUnlock} loading={busy}>
              {busy ? "Decrypting…" : "Unlock PDF"}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          onReset={() => {
            setResult(null);
            setPwd("");
            reset();
          }}
        />
      ) : null}
    </div>
  );
}