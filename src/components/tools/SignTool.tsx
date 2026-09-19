"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eraser } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button, Card, SectionHeading, Badge } from "@/components/ui";
import { ResultPanel } from "@/components/Result";
import { placeImageOnPdf } from "@/lib/pdf";
import { getPdfDocument } from "@/lib/pdfjs";
import type { ToolMeta } from "@/lib/tools";
import { usePdfFile } from "@/hooks/usePdfFile";

interface Metrics {
  widthPx: number; // rendered canvas width (px)
  heightPx: number;
  pageW: number; // PDF page size in points
  pageH: number;
}

interface PlacementState {
  metrics: Metrics;
  px: number; // CSS px in page container (equals canvas px)
  py: number;
  widthCss: number;
  signatureHeightRatio: number;
}

export default function SignTool({ meta: _meta }: { meta: ToolMeta }) {
  const { file, pageCount, load, reset } = usePdfFile();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<File[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const placementRef = useRef<PlacementState | null>(null);

  const total = pageCount ?? 0;

  async function doApply() {
    if (!file || !sig) return;
    const ps = placementRef.current;
    if (!ps || ps.metrics.pageW === 0) return;
    setBusy(true);
    setError(null);
    try {
      const { pageW, pageH } = ps.metrics;
      const m = ps.metrics;
      const scalePdfToPx = m.widthPx / pageW;
      const pdfX = ps.px / scalePdfToPx;
      const pdfY =
        pageH - (ps.py + ps.widthCss * ps.signatureHeightRatio) / scalePdfToPx;
      const pdfW = ps.widthCss / scalePdfToPx;
      const bytes = dataUrlToBytes(sig);
      const out = await placeImageOnPdf(file, page - 1, {
        imageBytes: bytes,
        imageMime: "image/png",
        x: pdfX,
        y: pdfY,
        width: pdfW,
      });
      setResult([out]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signing failed.");
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset();
                setPage(1);
                setSig(null);
              }}
            >
              Change file
            </Button>
          </Card>
        )}
      </section>

      {file && total > 0 ? (
        <>
          <section className="space-y-3">
            <SectionHeading step={2} title="Draw your signature" />
            <SignaturePad onChange={setSig} />
          </section>

          {sig ? (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionHeading
                  step={3}
                  title="Place it on the page"
                  hint={`Page ${page} of ${total} — drag to move, corner to resize`}
                />
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
              <PagePlacement
                file={file}
                page={page}
                sig={sig}
                onState={(s) => {
                  placementRef.current = s;
                }}
              />
            </section>
          ) : null}

          {error ? <p className="text-[13px] text-danger">{error}</p> : null}

          {sig ? (
            <div className="flex items-center gap-3">
              <Button size="lg" onClick={doApply} loading={busy}>
                {busy ? "Applying signature…" : "Sign PDF"}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      {result ? (
        <ResultPanel
          files={result}
          onReset={() => {
            setResult(null);
            setSig(null);
            setPage(1);
            reset();
          }}
        />
      ) : null}
    </div>
  );
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const SIG_RATIO = 0.42;

function PagePlacement({
  file,
  page,
  sig,
  onState,
}: {
  file: File;
  page: number;
  sig: string;
  onState: (s: PlacementState) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [placed, setPlaced] = useState<{ px: number; py: number; widthCss: number } | null>(null);
  const drag = useRef<{ mode: "move" | "resize"; startCX: number; startCY: number; ow: number; px: number; py: number } | null>(null);

  const laid = useMemo(() => {
    if (!metrics) return null;
    if (placed) return placed;
    const w = Math.round(metrics.widthPx * 0.3);
    return {
      px: Math.round((metrics.widthPx - w) / 2),
      py: Math.round(metrics.heightPx * 0.45),
      widthCss: w,
    };
  }, [metrics, placed]);

  const render = useCallback(async () => {
    const doc = await getPdfDocument(file);
    const pdfPage = await doc.getPage(page);
    const vp1 = pdfPage.getViewport({ scale: 1 });
    const scale = 880 / vp1.height;
    const vp = pdfPage.getViewport({ scale });
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    await pdfPage.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    setMetrics({ widthPx: vp.width, heightPx: vp.height, pageW: vp1.width, pageH: vp1.height });
  }, [file, page]);

  useEffect(() => {
    void render();
    drag.current = null;
  }, [render]);

  useEffect(() => {
    if (metrics && laid) {
      onState({ metrics, px: laid.px, py: laid.py, widthCss: laid.widthCss, signatureHeightRatio: SIG_RATIO });
    }
  }, [metrics, laid, onState]);

  const widthCss = laid?.widthCss ?? 150;
  const heightCss = widthCss * SIG_RATIO;
  const left = laid?.px ?? 0;
  const top = laid?.py ?? 0;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface-muted">
      <div
        ref={wrapRef}
        className="relative mx-auto w-fit max-w-full"
        style={{ touchAction: "none" }}
      >
        <canvas ref={canvasRef} className="block h-auto w-full" style={{ width: "100%" }} />
        {metrics && laid ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- data-URI signature overlay, draggable/resizable */}
            <img
              src={sig}
              alt="Signature"
              draggable={false}
              onPointerDown={(e) => {
                e.preventDefault();
                drag.current = {
                  mode: "move",
                  startCX: e.clientX,
                  startCY: e.clientY,
                  ow: widthCss,
                  px: left,
                  py: top,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d || d.mode !== "move") return;
                const nx = Math.max(0, Math.min(metrics.widthPx - widthCss, d.px + (e.clientX - d.startCX)));
                const ny = Math.max(0, Math.min(metrics.heightPx - heightCss, d.py + (e.clientY - d.startCY)));
                setPlaced({ px: nx, py: ny, widthCss });
              }}
              onPointerUp={() => (drag.current = null)}
              className="absolute cursor-move touch-none rounded-sm"
              style={{
                left,
                top,
                width: widthCss,
                height: heightCss,
                boxShadow: "0 1px 6px rgba(0,0,0,0.28)",
                border: "2px solid var(--accent)",
              }}
            />
            <div
              role="slider"
              aria-label="Resize signature"
              aria-valuemin={20}
              aria-valuemax={metrics.widthPx - left}
              aria-valuenow={widthCss}
              onPointerDown={(e) => {
                e.preventDefault();
                drag.current = {
                  mode: "resize",
                  startCX: e.clientX,
                  startCY: 0,
                  ow: widthCss,
                  px: left,
                  py: top,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d || d.mode !== "resize") return;
                const growth = (e.clientX - d.startCX) * (e.ctrlKey ? 0.5 : 1);
                const nw = Math.max(20, Math.min(metrics.widthPx - left, d.ow + growth));
                setPlaced({ px: left, py: top, widthCss: nw });
              }}
              onPointerUp={() => (drag.current = null)}
              className="absolute h-3.5 w-3.5 cursor-nwse-resize touch-none rounded-sm border-2 border-accent bg-surface"
              style={{ left: left + widthCss - 7, top: top + heightCss - 7 }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function SignaturePad({ onChange }: { onChange: (v: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = 520;
    const cssH = 200;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#18181b";
    ctx.fillStyle = "#18181b";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function pos(e: React.PointerEvent) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function emit() {
    const c = canvasRef.current;
    if (!c) return;
    const s = c.toDataURL("image/png");
    if (s.length > 120) onChange(s);
  }

  return (
    <Card className="p-4">
      <canvas
        ref={canvasRef}
        className="w-full touch-none cursor-crosshair rounded-xl"
        style={{ aspectRatio: "520 / 200", maxWidth: 520 }}
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = canvasRef.current!.getContext("2d");
          const { x, y } = pos(e);
          ctx!.beginPath();
          ctx!.moveTo(x, y);
          ctx!.lineTo(x + 0.01, y + 0.01);
          ctx!.stroke();
          canvasRef.current!.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current!.getContext("2d");
          const { x, y } = pos(e);
          ctx!.lineTo(x, y);
          ctx!.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          emit();
        }}
        onPointerCancel={() => (drawing.current = false)}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">Draw with your mouse, trackpad or finger</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const ctx = canvasRef.current?.getContext("2d");
            ctx?.clearRect(0, 0, 520 * (window.devicePixelRatio || 1), 200 * (window.devicePixelRatio || 1));
            onChange(null);
          }}
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
    </Card>
  );
}