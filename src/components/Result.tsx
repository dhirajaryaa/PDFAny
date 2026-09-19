"use client";

import { useState } from "react";
import { ArrowDownToLine, Check, RotateCcw } from "lucide-react";
import { downloadFile, formatBytes, formatPages } from "@/lib/pdf";
import { Button, Card } from "./ui";

interface Props {
  files: File[];
  onReset?: () => void;
  zipName?: string;
}

export function ResultPanel({ files, onReset, zipName }: Props) {
  const [done, setDone] = useState(false);
  const multiple = files.length > 1;

  return (
    <Card className="animate-fade-up flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <Check className="h-6 w-6" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="font-semibold">Ready to download</p>
        <p className="text-[13px] text-muted">
          {multiple
            ? `${files.length} files · ${formatBytes(
                files.reduce((s, f) => s + f.size, 0)
              )}`
            : `${files[0].name} · ${formatBytes(files[0].size)}`}
          {files[0].name.includes(".pdf") ? ` · ${""}` : ""}
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {multiple ? (
          <Button
            variant="outline"
            onClick={() => {
              if (zipName) downloadFilesAsZip(zipName, files);
              else files.forEach((f) => downloadFile(f));
              setDone(true);
            }}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Download all (.zip)
          </Button>
        ) : null}
        <Button
          onClick={() => {
            downloadFile(files[0]);
            setDone(true);
          }}
        >
          <ArrowDownToLine className="h-4 w-4" />
          Download
        </Button>
        {onReset ? (
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Start over
          </Button>
        ) : null}
      </div>
      {done ? (
        <p className="text-xs text-success">Download started</p>
      ) : null}
    </Card>
  );
}

export async function downloadFilesAsZip(name: string, files: File[]) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const f of files) zip.file(f.name.replace(/[/\\]/g, "_"), f);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export { formatPages };