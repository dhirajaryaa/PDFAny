import { PDFDocument, degrees, StandardFonts, rgb } from "pdf-lib";

export type Angle = 90 | 180 | 270;

export const PAPER_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Square: { width: 612, height: 612 },
};

export type PaperSize = keyof typeof PAPER_SIZES;

export interface FileLike extends Blob {
  readonly name: string;
  readonly lastModified: number;
}

export interface TextAnnotation {
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
}

export class PdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfError";
  }
}

export async function readFile(f: File | Blob): Promise<Uint8Array> {
  const buf = await f.arrayBuffer();
  return new Uint8Array(buf);
}

export async function openPdf(f: FileLike | Blob, ignoreEncryption = false): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(await readFile(f), {
      ignoreEncryption,
      updateMetadata: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/encrypted|password/i.test(msg)) {
      throw new PdfError("This PDF is password-protected.");
    }
    throw new PdfError("Could not read this file. Is it a valid PDF?");
  }
}

export function bytesToName(
  prefix: string,
  ext: string,
  index?: number
): string {
  const n = Number(index ?? 0);
  return n === 0 ? `${prefix}.${ext}` : `${prefix}-${n + 1}.${ext}`;
}

export async function save(doc: PDFDocument, name: string): Promise<File> {
  const bytes = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
  return toFile(bytes, name);
}

function toFile(bytes: Uint8Array, name: string): File {
  return new File([toBlobPart(bytes)], name, { type: "application/pdf" });
}

function toBlobPart(bytes: Uint8Array): BlobPart {
  // copy into a fresh ArrayBuffer-backed typed array
  return new Uint8Array(bytes);
}

function assertPageIndex(doc: PDFDocument, index: number) {
  if (index < 0 || index >= doc.getPageCount()) {
    throw new PdfError("Selected pages are no longer available.");
  }
}

async function copyPages(
  target: PDFDocument,
  source: PDFDocument,
  indices: number[]
): Promise<void> {
  for (const i of indices) {
    assertPageIndex(source, i);
    const [page] = await target.copyPages(source, [i]);
    target.addPage(page);
  }
}

/** Merge several PDFs into one new document. */
export async function mergePdfs(files: FileLike[]): Promise<File> {
  const out = await PDFDocument.create();
  for (const f of files) {
    const doc = await openPdf(f);
    await copyPages(out, doc, rangeIndexes(0, doc.getPageCount() - 1));
  }
  return save(out, "merged.pdf");
}

/** Build one PDF per page. */
export async function splitPerPage(f: FileLike): Promise<File[]> {
  const doc = await openPdf(f);
  const count = doc.getPageCount();
  const files: File[] = [];
  for (let i = 0; i < count; i++) {
    const out = await PDFDocument.create();
    await copyPages(out, doc, [i]);
    files.push(await save(out, bytesToName("page", "pdf", i)));
  }
  return files;
}

export interface Range {
  start: number; // 1-based inclusive
  end: number; // 1-based inclusive
}

export function parseRanges(input: string, pageCount: number): Range[] {
  const parts = input.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) throw new PdfError("Enter at least one range.");
  const ranges: Range[] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    let start: number;
    let end: number;
    if (m) {
      start = parseInt(m[1], 10);
      end = parseInt(m[2], 10);
    } else if (/^\d+$/.test(part)) {
      start = end = parseInt(part, 10);
    } else {
      throw new PdfError(`"${part}" is not a valid range.`);
    }
    if (start < 1 || end > pageCount || start > end) {
      throw new PdfError(`Range ${start}-${end} is outside the document.`);
    }
    ranges.push({ start, end });
  }
  // merge overlapping/adjacent, then sort
  ranges.sort((a, b) => a.start - b.start);
  const merged: Range[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end + 1) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

export function isAllRange(ranges: Range[], pageCount: number): boolean {
  if (ranges.length !== 1) return false;
  return ranges[0].start === 1 && ranges[0].end === pageCount;
}

export function rangesToIndexes(ranges: Range[]): number[] {
  const out: number[] = [];
  for (const r of ranges) for (let i = r.start - 1; i <= r.end - 1; i++) out.push(i);
  return out;
}

function rangeIndexes(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

/** Split a PDF into one file per parsed range. */
export async function splitRanges(f: FileLike, ranges: Range[]): Promise<File[]> {
  const doc = await openPdf(f);
  const files: File[] = [];
  for (let k = 0; k < ranges.length; k++) {
    const out = await PDFDocument.create();
    const idx = rangeIndexes(ranges[k].start - 1, ranges[k].end - 1);
    await copyPages(out, doc, idx);
    const name =
      ranges.length === 1
        ? "split.pdf"
        : bytesToName("split", "pdf", k);
    files.push(await save(out, name));
  }
  return files;
}

/** Keep only the given pages (0-based). */
export async function extractPdf(f: FileLike, keep: number[]): Promise<File> {
  if (keep.length === 0) throw new PdfError("Select at least one page.");
  const doc = await openPdf(f);
  const out = await PDFDocument.create();
  await copyPages(out, doc, keep);
  return save(out, "extracted.pdf");
}

/** Remove the given pages (0-based) and keep the rest. */
export async function deletePdf(f: FileLike, remove: Set<number>): Promise<File> {
  const doc = await openPdf(f);
  const keep = rangeIndexes(0, doc.getPageCount() - 1).filter((i) => !remove.has(i));
  if (keep.length === 0) throw new PdfError("At least one page must remain.");
  const out = await PDFDocument.create();
  await copyPages(out, doc, keep);
  return save(out, "edited.pdf");
}

export async function reorderPdf(f: FileLike, order: number[]): Promise<File> {
  if (order.length === 0) throw new PdfError("Page order is empty.");
  const doc = await openPdf(f);
  const out = await PDFDocument.create();
  await copyPages(out, doc, order);
  return save(out, "reordered.pdf");
}

export async function duplicatePdf(
  f: FileLike,
  indices: number[],
  copies = 1
): Promise<File> {
  const doc = await openPdf(f);
  const count = doc.getPageCount();
  const order: number[] = [];
  const dup = new Set(indices);
  for (let i = 0; i < count; i++) {
    order.push(i);
    if (dup.has(i)) {
      for (let c = 0; c < copies; c++) order.push(i);
    }
  }
  return reorderPdf(f, order);
}

export async function rotatePdf(
  f: FileLike,
  indices: number[],
  angle: Angle,
  direction: "cw" | "ccw" = "cw"
): Promise<File> {
  const doc = await openPdf(f);
  const sign = direction === "cw" ? 1 : -1;
  const target = new Set(indices);
  for (let i = 0; i < doc.getPageCount(); i++) {
    if (target.has(i)) {
      const page = doc.getPage(i);
      const current = page.getRotation().angle || 0;
      page.setRotation(degrees((current + sign * angle) % 360));
    }
  }
  return save(doc, "rotated.pdf");
}

export async function reversePdf(f: FileLike): Promise<File> {
  const doc = await openPdf(f);
  return reorderPdf(f, rangeIndexes(0, doc.getPageCount() - 1).reverse());
}

/** Export a 1-based page range. */
export async function rangePdf(f: FileLike, range: Range): Promise<File> {
  const doc = await openPdf(f);
  if (range.start < 1 || range.end > doc.getPageCount() || range.start > range.end) {
    throw new PdfError("Range is outside the document.");
  }
  const out = await PDFDocument.create();
  await copyPages(out, doc, rangeIndexes(range.start - 1, range.end - 1));
  return save(out, `pages-${range.start}-${range.end}.pdf`);
}

export function blankPageSize(size: PaperSize, landscape = false) {
  const dims = PAPER_SIZES[size];
  let width: number = dims.width;
  let height: number = dims.height;
  if (landscape) [width, height] = [height, width];
  return { width, height };
}

export interface InsertSpec {
  position: number; // pages are inserted after this 0-based index; -1 = at start
  size?: PaperSize;
  landscape?: boolean;
}

export async function insertBlankPdf(
  f: FileLike,
  specs: InsertSpec[],
  count = 1
): Promise<File> {
  const doc = await openPdf(f);
  const pageCount = doc.getPageCount();
  // sort so later insertions don't shift earlier positions
  const sorted = [...specs].sort((a, b) => a.position - b.position);
  for (const spec of sorted) {
    const { width, height } = blankPageSize(spec.size ?? "A4", spec.landscape ?? false);
    const at =
      spec.position < 0 ? 0 : Math.min(spec.position + 1, pageCount);
    for (let c = 0; c < count; c++) {
      doc.insertPage(at, [width, height]);
    }
  }
  return save(doc, "inserted.pdf");
}

export async function insertFromPdf(
  f: FileLike,
  other: FileLike,
  position: number, // 0 = at start, n = after page n-1
  otherPages?: number[]
): Promise<File> {
  const doc = await openPdf(f);
  const source = await openPdf(other);
  const at = Math.max(0, Math.min(position, doc.getPageCount()));
  const idx =
    otherPages && otherPages.length > 0
      ? otherPages
      : rangeIndexes(0, source.getPageCount() - 1);
  const pages = await doc.copyPages(source, idx);
  pages.forEach((p) => doc.insertPage(at, p));
  return save(doc, "inserted.pdf");
}

export async function imagesToPdf(files: FileLike[]): Promise<File> {
  if (files.length === 0) throw new PdfError("Add at least one image.");
  const doc = await PDFDocument.create();
  for (const f of files) {
    const bytes = await readFile(f);
    const mime = f.type;
    const img =
      mime === "image/png"
        ? await doc.embedPng(bytes)
        : await doc.embedJpg(bytes);
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return save(doc, "images.pdf");
}

export interface SignPlacement {
  imageBytes: Uint8Array;
  imageMime: string;
  x: number; // pdf coords (origin bottom-left)
  y: number;
  width: number;
}

/** Draw a signature/logo image onto a page. */
export async function placeImageOnPdf(
  f: FileLike,
  pageIndex: number,
  placement: SignPlacement
): Promise<File> {
  const doc = await openPdf(f);
  assertPageIndex(doc, pageIndex);
  const page = doc.getPage(pageIndex);
  const img =
    placement.imageMime === "image/png"
      ? await doc.embedPng(placement.imageBytes)
      : await doc.embedJpg(placement.imageBytes);
  const scale = placement.width / img.width;
  page.drawImage(img, {
    x: placement.x,
    y: placement.y,
    width: placement.width,
    height: img.height * scale,
  });
  return save(doc, "signed.pdf");
}

/** Draw text annotations (used by the simple editor fallback). */
export async function addTextAnnotations(
  f: FileLike,
  perPage: Map<number, TextAnnotation[]>
): Promise<File> {
  const doc = await openPdf(f);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const [pageIdx, anns] of perPage) {
    assertPageIndex(doc, pageIdx);
    const page = doc.getPage(pageIdx);
    for (const a of anns) {
      page.drawText(a.text, {
        x: a.x,
        y: a.y,
        size: a.size,
        font,
        color: rgb(
          parseInt(a.color.slice(1, 3), 16) / 255,
          parseInt(a.color.slice(3, 5), 16) / 255,
          parseInt(a.color.slice(5, 7), 16) / 255
        ),
      });
    }
  }
  return save(doc, "edited.pdf");
}

/** Rasterize an annotation overlay PNG onto a page. */
export async function overlayImageOnPdf(
  f: FileLike,
  pageIndex: number,
  pngBytes: Uint8Array,
  pageWidth: number,
  pageHeight: number
): Promise<File> {
  const bytes = await overlayImageOnBytes(await readFile(f), pageIndex, pngBytes, pageWidth, pageHeight);
  return toFile(bytes, "edited.pdf");
}

/** Rasterize an annotation overlay PNG onto a page of raw PDF bytes. */
export async function overlayImageOnBytes(
  src: Uint8Array,
  pageIndex: number,
  pngBytes: Uint8Array,
  pageWidth: number,
  pageHeight: number
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(src, { ignoreEncryption: true, updateMetadata: false });
  assertPageIndex(doc, pageIndex);
  const page = doc.getPage(pageIndex);
  const img = await doc.embedPng(pngBytes);
  page.drawImage(img, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

/** Add page numbers to the bottom of every page. */
export async function addPageNumbersPdf(
  f: FileLike,
  opts: { start: number; position: "bottom-left" | "bottom-center" | "bottom-right" | "top-right" }
): Promise<File> {
  const doc = await openPdf(f);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const size = 11;
  const padding = 20;
  for (let i = 0; i < doc.getPageCount(); i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const label = String(opts.start + i);
    const textWidth = font.widthOfTextAtSize(label, size);
    let x = padding;
    let y = padding;
    if (opts.position === "bottom-center") x = (width - textWidth) / 2;
    if (opts.position === "bottom-right" || opts.position === "top-right") x = width - textWidth - padding;
    if (opts.position === "top-right") y = height - padding - size;
    page.drawText(label, {
      x,
      y,
      size,
      font,
      color: rgb(0.35, 0.35, 0.38),
    });
  }
  return save(doc, "numbered.pdf");
}

/** Draw a text watermark across every page. */
export async function watermarkPdf(
  f: FileLike,
  opts: { text: string; opacity: number }
): Promise<File> {
  const doc = await openPdf(f);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const size = 64;
  for (let i = 0; i < doc.getPageCount(); i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(opts.text, size);
    page.drawText(opts.text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size,
      font,
      opacity: Math.max(0.05, Math.min(0.5, opts.opacity)),
      rotate: degrees(-30),
      color: rgb(0.4, 0.4, 0.43),
    });
  }
  return save(doc, "watermarked.pdf");
}

export function downloadFile(file: File, revoke = true): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadZip(name: string, files: File[]): void {
  void import("jszip").then(({ default: JSZip }) => {
    const zip = new JSZip();
    for (const f of files) zip.file(f.name, f);
    void zip
      .generateAsync({ type: "blob" }, (metadata) => {
        if (onZipProgress) onZipProgress(metadata.percent / 100);
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        onZipProgress = null;
      });
  });
}

let onZipProgress: ((p: number) => void) | null = null;
export function setZipProgress(fn: ((p: number) => void) | null): void {
  onZipProgress = fn;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatPages(n: number): string {
  return `${n} page${n === 1 ? "" : "s"}`;
}