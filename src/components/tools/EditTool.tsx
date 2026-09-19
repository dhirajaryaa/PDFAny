"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Type,
  Pencil,
  Highlighter,
  Square,
  ArrowUpRight,
  Undo2,
  Trash2,
} from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading, Badge } from "@/components/ui";
import { PageGrid } from "@/components/PageGrid";
import { ResultPanel } from "@/components/Result";
import { readFile, overlayImageOnBytes } from "@/lib/pdf";
import { getPdfDocument } from "@/lib/pdfjs";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

type Tool = "pen" | "highlight" | "text" | "rect" | "arrow";

interface Pt {
  x: number;
  y: number;
}

export type Ann =
  | { kind: "pen" | "highlight"; points: Pt[]; color: string; width: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number; color: string; width: number }
  | { kind: "arrow"; x1: number; y1: number; x2: number; y2: number; color: string; width: number }
  | { kind: "text"; x: number; y: number; text: string; size: number; color: string };

const COLORS = ["#18181b", "#dc2626", "#2563eb", "#16a34a", "#d97706", "#9333ea"];
const TEXT_SIZES = [14, 18, 24];
const TOOL_COLORS: Tool[] = ["pen", "highlight", "rect", "arrow"];

const TOOLS: { id: Tool; label: string; icon: typeof Pencil }[] = [
  { id: "pen", label: "Draw", icon: Pencil },
  { id: "highlight", label: "Highlight", icon: Highlighter },
  { id: "text", label: "Text", icon: Type },
  { id: "rect", label: "Box", icon: Square },
  { id: "arrow", label: "Arrow", icon: ArrowUpRight },
];

export default function EditTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [page, setPage] = useState(1);
  const [byPage, setByPage] = useState<Record<number, Ann[]>>({});
  const [result, setResult] = useState<File[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState(COLORS[1]);
  const [tool, setTool] = useState<Tool>("pen");
  const [textSize, setTextSize] = useState(18);

  const total = pageCount ?? 0;
  const pageIdx = page - 1;
  const items = byPage[pageIdx] ?? [];
  const metricsRef = useRef<Map<number, { pageW: number; pageH: number; widthPx: number; heightPx: number }>>(new Map());

  const setItems = useCallback(
    (updater: (prev: Ann[]) => Ann[]) => {
      setByPage((prev) => ({ ...prev, [pageIdx]: updater(prev[pageIdx] ?? []) }));
    },
    [pageIdx]
  );

  const onMetrics = useCallback(
    (m: { pageW: number; pageH: number; widthPx: number; heightPx: number }) => {
      metricsRef.current.set(pageIdx, m);
    },
    [pageIdx]
  );

  async function doExport() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      let bytes = await readFile(file);
      const edited = Object.entries(byPage).filter(([, a]) => a.length > 0);
      if (edited.length === 0) {
        setError("Edit at least one page first.");
        setBusy(false);
        return;
      }
      for (const [key, itemsArr] of edited) {
        const m = metricsRef.current.get(Number(key));
        if (!m) continue;
        const png = await renderAnnotationsToPng(itemsArr, m.widthPx, m.heightPx);
        bytes = await overlayImageOnBytes(bytes, Number(key), png, m.pageW, m.pageH);
      }
      setResult([new File([new Uint8Array(bytes)], "edited.pdf", { type: "application/pdf" })]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
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
              <p className="text-xs text-muted">{total ? `${total} pages` : "Reading pages…"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              Change file
            </Button>
          </Card>
        )}
      </section>

      {file && total > 0 ? (
        <>
          <Card className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeading step={2} title="Edit page" hint={`Page ${page} of ${total}`} />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge className="min-w-12 justify-center">{page}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Next page"
                  disabled={page >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Annotator
              key={page}
              file={file}
              page={page}
              items={items}
              setItems={setItems}
              tool={tool}
              color={color}
              textSize={textSize}
              onMetrics={onMetrics}
            />

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-border bg-surface-muted p-1">
                {TOOLS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    title={t.label}
                    aria-label={t.label}
                    className={`rounded-md p-2 transition-colors ${
                      tool === t.id ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <t.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              {TOOL_COLORS.includes(tool) ? (
                <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted p-1">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      aria-label={`Color ${c}`}
                      className={`h-6 w-6 rounded-full border-2 transition-transform ${
                        color === c ? "scale-110 border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              ) : null}
              {tool === "text" ? (
                <div className="inline-flex items-center rounded-lg border border-border bg-surface-muted p-1">
                  {TEXT_SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTextSize(s)}
                      aria-label={`Text size ${s}px`}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        textSize === s ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
                      }`}
                    >
                      {s}px
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="ms-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setItems((prev) => prev.slice(0, -1))} disabled={items.length === 0}>
                  <Undo2 className="h-3.5 w-3.5" />
                  Undo
                </Button>
                <Button variant="danger" size="sm" onClick={() => setItems(() => [])} disabled={items.length === 0}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear page
                </Button>
              </div>
            </div>
          </Card>

          <details className="rounded-xl border border-border bg-surface p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-muted">
              Jump to a page
            </summary>
            <div className="mt-4">
              <PageGrid file={file} order={Array.from({ length: total }, (_, i) => i)} mode="static" onCellClick={(i) => setPage(i + 1)} />
            </div>
          </details>

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" onClick={doExport} loading={busy}>
              {busy ? "Exporting…" : "Download edited PDF"}
            </Button>
          </div>
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          onReset={() => {
            setResult(null);
            setByPage({});
            setPage(1);
            reset();
          }}
        />
      ) : null}
    </div>
  );
}

async function renderAnnotationsToPng(items: Ann[], widthPx: number, heightPx: number): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(widthPx));
  canvas.height = Math.max(1, Math.floor(heightPx));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  for (const a of items) drawAnn(ctx, a);
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/png")
  );
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

function drawAnn(ctx: CanvasRenderingContext2D, a: Ann) {
  switch (a.kind) {
    case "highlight": {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = a.color;
      ctx.lineWidth = a.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      strokePoints(ctx, a.points);
      ctx.restore();
      break;
    }
    case "pen": {
      ctx.save();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = a.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      strokePoints(ctx, a.points);
      ctx.restore();
      break;
    }
    case "rect": {
      ctx.save();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = a.width;
      ctx.strokeRect(a.x, a.y, a.w, a.h);
      ctx.restore();
      break;
    }
    case "arrow": {
      ctx.save();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = a.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(a.x1, a.y1);
      ctx.lineTo(a.x2, a.y2);
      ctx.stroke();
      const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
      const hl = Math.max(8, a.width * 3);
      const ha = Math.PI / 7;
      ctx.beginPath();
      ctx.moveTo(a.x2, a.y2);
      ctx.lineTo(a.x2 - hl * Math.cos(angle - ha), a.y2 - hl * Math.sin(angle - ha));
      ctx.moveTo(a.x2, a.y2);
      ctx.lineTo(a.x2 - hl * Math.cos(angle + ha), a.y2 - hl * Math.sin(angle + ha));
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "text": {
      ctx.save();
      ctx.fillStyle = a.color;
      ctx.font = `${a.size}px system-ui, sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(a.text, a.x, a.y);
      ctx.restore();
      break;
    }
  }
}

function strokePoints(ctx: CanvasRenderingContext2D, points: Pt[]) {
  if (points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
}

function Annotator({
  file,
  page,
  items,
  setItems,
  tool,
  color,
  textSize,
  onMetrics,
}: {
  file: File;
  page: number;
  items: Ann[];
  setItems: (updater: (prev: Ann[]) => Ann[]) => void;
  tool: Tool;
  color: string;
  textSize: number;
  onMetrics: (m: { pageW: number; pageH: number; widthPx: number; heightPx: number }) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState<{ pageW: number; pageH: number; widthPx: number; heightPx: number } | null>(null);
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");
  const stroke = useRef<{ kind: Tool; points: Pt[]; start: Pt; color: string; width: number } | null>(null);
  const tempRef = useRef<Ann | null>(null);

  const render = useCallback(async () => {
    const doc = await getPdfDocument(file);
    const pdfPage = await doc.getPage(page);
    const vp1 = pdfPage.getViewport({ scale: 1 });
    const scale = 1000 / vp1.height;
    const vp = pdfPage.getViewport({ scale });
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    await pdfPage.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    const m = { pageW: vp1.width, pageH: vp1.height, widthPx: vp.width, heightPx: vp.height };
    setMetrics(m);
    onMetrics(m);
  }, [file, page, onMetrics]);

  useEffect(() => {
    void render();
  }, [render]);

  function pos(e: React.PointerEvent): Pt {
    const ov = overlayRef.current!;
    const r = ov.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (ov.width / r.width),
      y: (e.clientY - r.top) * (ov.height / r.height),
    };
  }

  function redraw() {
    const ov = overlayRef.current;
    const ctx = ov?.getContext("2d");
    if (!ov || !ctx) return;
    ctx.clearRect(0, 0, ov.width, ov.height);
    for (const a of items) drawAnn(ctx, a);
    if (tempRef.current) drawAnn(ctx, tempRef.current);
  }

  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, color, metrics]);

  function commitText() {
    if (!draft || !textValue.trim()) {
      setDraft(null);
      return;
    }
    setItems((prev) => [
      ...prev,
      { kind: "text", x: draft.x, y: draft.y, text: textValue.trim(), size: textSize, color: COLORS[0] },
    ]);
    setDraft(null);
    setTextValue("");
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-muted">
      <div className="relative mx-auto w-fit max-w-full" style={{ touchAction: "none" }}>
        <canvas ref={canvasRef} className="block h-auto w-full" style={{ width: "100%" }} />
        <canvas
          ref={overlayRef}
          className={`absolute inset-0 block h-auto w-full ${tool === "text" ? "cursor-text" : "cursor-crosshair"}`}
          style={{ width: "100%" }}
          onPointerDown={(e) => {
            const { x, y } = pos(e);
            if (tool === "text") {
              setDraft({ x, y });
              setTextValue("");
              return;
            }
            e.currentTarget.setPointerCapture(e.pointerId);
            if (tool === "pen" || tool === "highlight") {
              const w = tool === "highlight" ? 20 : 3.5;
              stroke.current = { kind: tool, points: [{ x, y }], start: { x, y }, color, width: w };
              tempRef.current = { kind: tool, points: [{ x, y }], color, width: w };
            } else {
              stroke.current = { kind: tool, points: [{ x, y }], start: { x, y }, color, width: 3 };
            }
            redraw();
          }}
          onPointerMove={(e) => {
            const { x, y } = pos(e);
            const s = stroke.current;
            if (!s) return;
            if (s.kind === "pen" || s.kind === "highlight") {
              s.points.push({ x, y });
              tempRef.current = { kind: s.kind, points: s.points, color: s.color, width: s.width };
            } else if (s.kind === "rect") {
              tempRef.current = {
                kind: "rect",
                x: s.start.x,
                y: s.start.y,
                w: x - s.start.x,
                h: y - s.start.y,
                color: s.color,
                width: s.width,
              };
            } else if (s.kind === "arrow") {
              tempRef.current = { kind: "arrow", x1: s.start.x, y1: s.start.y, x2: x, y2: y, color: s.color, width: s.width };
            }
            redraw();
          }}
          onPointerUp={() => {
            if (stroke.current && tempRef.current) {
              setItems((prev) => [...prev, tempRef.current!]);
            }
            stroke.current = null;
            tempRef.current = null;
          }}
          onPointerCancel={() => {
            stroke.current = null;
            tempRef.current = null;
            redraw();
          }}
        />
        {draft ? (
          <input
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText();
              if (e.key === "Escape") setDraft(null);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Type…"
            className="absolute z-10 min-w-40 border-2 border-accent bg-surface/95 px-2 py-1 outline-none"
            style={{
              left: draft.x,
              top: draft.y,
              color: COLORS[0],
              fontSize: textSize,
            }}
          />
        ) : null}
      </div>
      {metrics ? (
        <p className="px-4 pb-3 pt-2 text-xs text-muted">
          {tool === "text" ? "Click anywhere on the page to place text." : "Draw with your mouse or finger."} Overlays are flattened into the PDF on export.
        </p>
      ) : null}
    </div>
  );
}