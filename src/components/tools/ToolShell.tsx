"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { TOOL_BY_SLUG, type ToolMeta } from "@/lib/tools";
import { BackLink, Spinner } from "@/components/ui";

type Loader = () => Promise<{ default: ComponentType<{ meta: ToolMeta }> }>;

const loaders: Record<string, Loader> = {
  merge: () => import("./MergeTool"),
  split: () => import("./SplitTool"),
  extract: () => import("./ExtractTool"),
  delete: () => import("./DeleteTool"),
  reorder: () => import("./ReorderTool"),
  duplicate: () => import("./DuplicateTool"),
  rotate: () => import("./RotateTool"),
  reverse: () => import("./ReverseTool"),
  insert: () => import("./InsertTool"),
  range: () => import("./RangeTool"),
  sign: () => import("./SignTool"),
  edit: () => import("./EditTool"),
  "images-to-pdf": () => import("./ImagesToPdfTool"),
  "pdf-to-images": () => import("./PdfToImagesTool"),
  protect: () => import("./ProtectTool"),
  unlock: () => import("./UnlockTool"),
};

export function ToolShell({ slug }: { slug: string }) {
  const meta = TOOL_BY_SLUG[slug];
  const loader = loaders[slug];
  if (!meta || !loader) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-muted">
        Tool not found.
      </div>
    );
  }

  const Content = dynamic(loader, {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-28">
        <Spinner className="h-6 w-6" />
      </div>
    ),
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 pt-8 sm:px-8">
      <div className="mb-8">
        <BackLink />
        <div className="mt-5 flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
          >
            {iconFor(meta.slug, "h-6 w-6")}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{meta.name}</h1>
            <p className="text-[15px] text-muted">{meta.tagline}</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          {meta.longDescription}
        </p>
      </div>
      <Content meta={meta} />
    </main>
  );
}

import { iconMap } from "@/lib/icons";
function iconFor(slug: string, className: string) {
  const fn = iconMap[slug];
  return fn ? fn(className) : null;
}