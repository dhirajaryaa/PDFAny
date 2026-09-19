"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { CloudUpload, FileText } from "lucide-react";
import { formatBytes } from "@/lib/pdf";

interface Props {
  accept: string;
  multiple?: boolean;
  label: string;
  onFiles: (files: File[]) => void;
  caption?: string;
  children?: ReactNode;
}

export function FileDropzone({
  accept,
  multiple = true,
  label,
  onFiles,
  caption,
  children,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const files = Array.from(list).filter((f) => {
        if (f.type && !accept.includes(f.type)) return false;
        if (!f.type && accept.includes("/pdf")) return f.name.toLowerCase().endsWith(".pdf");
        return true;
      });
      if (files.length === 0) {
        setError(`That file type isn't supported. ${label}.`);
        return;
      }
      setError(null);
      onFiles(multiple ? files : [files[0]]);
    },
    [accept, multiple, label, onFiles]
  );

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Select files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files);
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-border bg-surface hover:border-accent hover:bg-surface-muted"
        }`}
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
            dragging ? "bg-accent text-accent-foreground" : "bg-surface-muted text-muted group-hover:text-accent"
          }`}
        >
          <CloudUpload className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <p className="text-[15px] font-medium">
            Drag &amp; drop {label.toLowerCase()}{" "}
            <span className="text-muted">or</span>{" "}
            <span className="text-accent underline decoration-accent/30 underline-offset-4">
              browse
            </span>
          </p>
          <p className="text-[13px] text-muted">
            {caption ?? "Files are processed entirely on this device — nothing gets uploaded."}
          </p>
        </div>
        {children}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      {error ? <p className="text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}

export function FileBadge({ file, onRemove }: { file: File; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <FileText className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted">{formatBytes(file.size)}</p>
      </div>
      {onRemove ? (
        <button
          onClick={onRemove}
          aria-label="Remove file"
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-danger"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}