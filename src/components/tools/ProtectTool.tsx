"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { protectPdf } from "@/lib/pdf";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

export default function ProtectTool({ meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<File[] | null>(null);

  const mismatch = pwd.length > 0 && pwd !== confirm;
  const valid = pwd.length >= 4 && !mismatch;

  async function doProtect() {
    if (!file || !valid) return;
    setBusy(true);
    setError(null);
    try {
      const out = await protectPdf(file, pwd, { allowPrinting, allowCopying });
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Protect failed.");
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
            <SectionHeading step={2} title="Set a password" />
            <div className="grid max-w-md gap-4">
              <label className="space-y-1.5">
                <span className="text-[13px] font-medium">Password</span>
                <input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="At least 4 characters"
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[13px] font-medium">Confirm password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat the password"
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-accent"
                />
              </label>
              {mismatch ? <p className="text-[13px] text-danger">Passwords do not match.</p> : null}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowPrinting}
                  onChange={(e) => setAllowPrinting(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-accent"
                />
                Allow printing
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowCopying}
                  onChange={(e) => setAllowCopying(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-accent"
                />
                Allow copying text
              </label>
            </div>
          </section>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" disabled={!valid} onClick={doProtect} loading={busy}>
              {busy ? "Encrypting…" : "Protect PDF"}
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
            setConfirm("");
            reset();
          }}
        />
      ) : null}
    </div>
  );
}