# PDFAny — Project Context

Client-side PDF toolkit. Everything runs 100% in the browser — no server processing, files never leave the device.

## Stack
- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · pnpm only.
- `motion` (motion/react) — animations: blur-fade h1 on home/tool pages (ToolShell, homepage), scroll-reveal + hover/tap micro-interactions via `ToolCard`. Wrap app in `<MotionConfig reducedMotion="user">` (root layout). `fresh install` adds `motion` as a dependency (single install).
- `pdf-lib` — all PDF mutations. `pdfjs-dist` v6 — rendering/thumbnails (worker via `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)`). `lucide-react` icons. `jszip` (lazy) — zip downloads.
- `next/og` ImageResponse for `opengraph-image` / `twitter-image` + per-tool variants in `[slug]/`. Logo embedded as **PNG** data-URI (`src/lib/logo.ts`: `LOGO_DATA_URI` = original, `LOGO_DATA_URI_INVERTED` = negated for the dark OG card) — an image/webp data-URI breaks the build-time render here (no sharp); keep PNG. The brand logo itself is the original `public/logo.webp` (monochrome, gray+alpha); header `LogoMark` uses `next/image` `/logo.webp` with `invert dark:invert-0`; favicon = `public/logo.png`, apple icon = `public/apple-touch-icon.png` (regenerate via `magick public/logo.webp -background none public/logo.png`; inverted OG variant via `magick public/logo.png -negate public/logo-inverted.png`).

## Commands
- `pnpm dev` · `pnpm build` · `pnpm start` (serves the exported `out/` via `serve`; `next start` is unavailable with `output: export`) · `pnpm preview` (same, on :3571) · `pnpm lint`
- **Fully static**: `next.config.ts` uses `output: "export"` (+ `images.unoptimized`). Every page, all 33 OG/twitter images (root + 16 tools × 2), `sitemap.xml`, `robots.txt` are generated **once at build time** into `out/`. Tool pages use `generateStaticParams`; metadata-image/robots/sitemap route handlers set `export const dynamic = "force-static"`. No runtime requests to generate anything.
- Site URL from `.env.local` -> `NEXT_PUBLIC_SITE_URL` (default `https://pdfany.app`). See `.env.example`. `SITE.domain` in `src/lib/tools.ts` is the single consumer; canonical/sitemap/robots/OG all read it. Used verbatim in the exported HTML — set the real domain before building.

## Structure (src/...)
- `lib/tools.ts` — `SITE`, category list, `TOOLS` + `TOOL_BY_SLUG` registry (16 tools: merge, split, extract, delete, reorder, duplicate, rotate, reverse, insert, range, sign, edit, images-to-pdf, pdf-to-images, page-numbers, watermark). **Add/remove tools here AND in `components/tools/ToolShell.tsx` dynamic map AND `lib/icons.tsx`.** Every tool needs `description`, `longDescription`, `keywords`, `how` (H2 heading, natural "How to …" keyword phrase) + `steps` (3-4 unique steps, rendered as the `<ol id="how-to">` on each tool page for SEO content depth).
- `lib/pdf.ts` — pdf-lib ops (openPdf, mergePdfs, split*, extractPdf, deletePdf, reorderPdf, duplicatePdf, rotatePdf, reversePdf, rangePdf, insertBlankPdf, insertFromPdf, imagesToPdf, placeImageOnPdf, overlayImageOnPdf/overlayImageOnBytes, addPageNumbersPdf, watermarkPdf, downloadFile, downloadZip).
- `lib/pdfjs.ts` — doc cache, queued thumbnails, exportPdfPageAsJpeg, `releasePdf` via `loadingTask.destroy()` (no `destroy()` in v6).
- `lib/og.tsx` — shared OG image builder (logo + "Made by Dhiraj Arya" + GitHub avatar `https://github.com/dhirajaryaa.png`).
- `components/` — ui.tsx primitives, layout.tsx (Header/Footer/Brand/LogoMark), ToolCard (motion hover/tap card), FileDropzone, PageThumb, PageGrid, Result, tools/*.tsx (16 tool components, dynamic-imported), ToolShell (blur-fade h1 + "How to" `<ol id="how-to">`), ThemeToggle.
- `app/` — root layout (SEO, JSON-LD, MotionConfig), homepage (hero/search/categories), `tools/page.tsx` (all-tools list, grouped by category), `[slug]/page.tsx` (generateMetadata + per-tool JSON-LD/Breadcrumb), robots.ts, sitemap.ts, opengraph-image.tsx, `[slug]/opengraph-image.tsx` + `[slug]/twitter-image.tsx`, error.tsx, global-error.tsx, not-found.tsx, icon.svg.
- `public/illustrations/` — undraw.co SVGs (documents.svg hero, filing.svg tool banner, signature.svg, upload.svg) recolored to brand indigo `#6366f1`; loaded as static `<img>` with eslint-disable (SVGs not supported by next/image).

## Conventions & gotchas (stay lint/TS clean)
- **Next 16**: layout/page props take `params` as a **Promise** — await it. `LayoutProps`/`PageProps` are global types from `next typegen`.
- **pdf-lib 1.17 has NO encrypt/decrypt** — protect/unlock features are intentionally absent (replaced by page-numbers + watermark).
- **pdfjs-dist v6**: `getDocument({ data })` accepts string|ArrayBuffer|TypedArray only (not Blob/Promise); `isEvalSupported` was removed.
- **TS BlobPart**: `Uint8Array<ArrayBufferLike>` is not assignable to `BlobPart` — pass copies (`toBlobPart` helper in pdf.ts).
- **next/og**: any `div` with >1 child (e.g. a `<br/>`) needs explicit `display: flex|contents|none`, else satori errors.
- **Lint**: eslint-plugin-react-hooks 7 — do NOT call setState synchronously inside effects, do NOT read/write refs during render, do NOT create components during render. Derive state during render instead (React "adjusting state" pattern), see ReorderTool. `_`-prefixed unused args allowed via eslint.config.mjs.
- Tool components receive a required `{ meta }` prop from ToolShell but most don't use it — keep it as `_meta` when unused.
- **Dark/light**: CSS-variable tokens guarded by `.dark` class (not media query); `ThemeToggle` uses `useSyncExternalStore` + a pre-hydration inline script in the root layout (no FOUC).
- Branding: logo = gradient (indigo→violet) badge with "P" (`LogoMark`/`icon.svg`). Author: **Dhiraj Arya** — dhirajarya.in, github.com/dhirajaryaa, blogdrop.in, lowpdf.dhirajarya.in, linkedin.com/in/dhirajarya01, mailto:hello@dhirajarya.in (catch-all domain).
