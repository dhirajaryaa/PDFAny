"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { TOOL_BY_SLUG, type ToolMeta } from "@/lib/tools";
import { BackLink, Spinner } from "@/components/ui";
import { iconMap } from "@/lib/icons";

const Loading = () => (
  <div className="flex items-center justify-center py-28">
    <Spinner className="h-6 w-6" />
  </div>
);

const DynamicTools: Record<string, ComponentType<{ meta: ToolMeta }>> = {
  merge: dynamic(() => import("./MergeTool"), { ssr: false, loading: Loading }),
  split: dynamic(() => import("./SplitTool"), { ssr: false, loading: Loading }),
  extract: dynamic(() => import("./ExtractTool"), { ssr: false, loading: Loading }),
  delete: dynamic(() => import("./DeleteTool"), { ssr: false, loading: Loading }),
  reorder: dynamic(() => import("./ReorderTool"), { ssr: false, loading: Loading }),
  duplicate: dynamic(() => import("./DuplicateTool"), { ssr: false, loading: Loading }),
  rotate: dynamic(() => import("./RotateTool"), { ssr: false, loading: Loading }),
  reverse: dynamic(() => import("./ReverseTool"), { ssr: false, loading: Loading }),
  insert: dynamic(() => import("./InsertTool"), { ssr: false, loading: Loading }),
  range: dynamic(() => import("./RangeTool"), { ssr: false, loading: Loading }),
  sign: dynamic(() => import("./SignTool"), { ssr: false, loading: Loading }),
  edit: dynamic(() => import("./EditTool"), { ssr: false, loading: Loading }),
  "images-to-pdf": dynamic(() => import("./ImagesToPdfTool"), { ssr: false, loading: Loading }),
  "pdf-to-images": dynamic(() => import("./PdfToImagesTool"), { ssr: false, loading: Loading }),
  "page-numbers": dynamic(() => import("./PageNumbersTool"), { ssr: false, loading: Loading }),
  watermark: dynamic(() => import("./WatermarkTool"), { ssr: false, loading: Loading }),
};

export function ToolShell({ slug }: { slug: string }) {
  const meta = TOOL_BY_SLUG[slug];
  const Content = DynamicTools[slug];
  if (!meta || !Content) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-muted">
        Tool not found.
      </div>
    );
  }

  const icon = iconMap[slug];
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 pt-8 sm:px-8">
      <div className="mb-8">
        <BackLink />
        <div className="mt-5 flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
          >
            {icon ? icon("h-6 w-6") : null}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{meta.name}</h1>
            <p className="text-[15px] text-muted">{meta.tagline}</p>
          </div>
        </div>
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-surface-muted/50">
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG illustration */}
          <img
            src="/illustrations/filing.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -right-6 h-48 w-48 select-none opacity-50 sm:h-56 sm:w-56"
          />
          <p className="relative max-w-2xl p-6 text-[15px] leading-relaxed text-muted">
            {meta.longDescription}
          </p>
        </div>
      </div>
      <Content meta={meta} />
    </main>
  );
}