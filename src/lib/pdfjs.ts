import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";

let workerConfigured = false;

export function initPdfjs(): void {
  if (workerConfigured) return;
  workerConfigured = true;
  try {
    GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  } catch {
    /* fall back to the default worker path */
  }
}

const docCache = new Map<string, Promise<PDFDocumentProxy>>();

function fileKey(f: File | Blob): string {
  const f2 = f as unknown as { name?: string; lastModified?: number; size?: number };
  return `[${f2.name ?? "blob"}][${f2.size ?? f.size}][${f2.lastModified ?? 0}]`;
}

export function getPdfDocument(f: File | Blob): Promise<PDFDocumentProxy> {
  initPdfjs();
  const key = fileKey(f);
  let p = docCache.get(key);
  if (!p) {
    p = f
      .arrayBuffer()
      .then((data) => getDocument({ data }).promise);
    docCache.set(key, p);
    p.catch(() => docCache.delete(key));
  }
  return p;
}

export interface PageRender {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function renderPage(
  f: File | Blob,
  pageNumber: number, // 1-based
  maxWidth = 512,
  maxHeight = 720,
  scale = 1
): Promise<PageRender> {
  const doc = await getPdfDocument(f);
  const page = await doc.getPage(pageNumber);
  const viewport1 = page.getViewport({ scale: 1 });
  const targetW = Math.min(viewport1.width * scale, maxWidth * scale);
  const fit = Math.min(targetW / viewport1.width, maxHeight / viewport1.height);
  const useScale = scale * Math.min(1, fit);
  const viewport = page.getViewport({ scale: useScale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas not supported");
  await page.render({
    canvasContext: ctx,
    viewport,
    canvas,
  }).promise;
  return {
    pageNumber,
    dataUrl: canvas.toDataURL("image/jpeg", 0.88),
    width: canvas.width,
    height: canvas.height,
  };
}

export async function getPdfPageCount(f: File | Blob): Promise<number> {
  const doc = await getPdfDocument(f);
  return doc.numPages;
}

const thumbCache = new Map<string, Promise<string>>();
let queue: Promise<unknown> = Promise.resolve();
let activeRenders = 0;
const MAX_CONCURRENT_RENDERS = 2;

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    while (activeRenders >= MAX_CONCURRENT_RENDERS) {
      await new Promise((r) => setTimeout(r, 30));
    }
    activeRenders++;
    try {
      return await task();
    } finally {
      activeRenders--;
    }
  });
  queue = run.catch(() => undefined);
  return run as Promise<T>;
}

export function getPageThumbnail(
  f: File | Blob,
  pageNumber: number,
  maxWidth = 460,
  scale = 1
): Promise<string> {
  const key = `${fileKey(f)}|${pageNumber}|${maxWidth}|${scale}`;
  let p = thumbCache.get(key);
  if (!p) {
    p = enqueue(() =>
      renderPage(f, pageNumber, maxWidth, 640, scale).then((r) => r.dataUrl)
    );
    thumbCache.set(key, p);
    p.catch(() => thumbCache.delete(key));
  }
  return p;
}

export async function exportPdfPageAsJpeg(
  f: File | Blob,
  pageNumber: number,
  scale = 1,
  quality = 0.92
): Promise<Blob> {
  const doc = await getPdfDocument(f);
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", quality)
  );
}

export async function releasePdf(f: File | Blob): Promise<void> {
  const key = fileKey(f);
  const p = docCache.get(key);
  if (p) {
    docCache.delete(key);
    try {
      const doc = await p;
      await doc.loadingTask.destroy();
    } catch {
      /* ignore */
    }
  }
}