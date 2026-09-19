# PDFAny

Free, private PDF tools that run 100% in your browser. No uploads — files never leave your device.

## Tools

- **Organize** — merge, split, extract, delete, reorder, duplicate, rotate, reverse, insert, page-range export
- **Annotate** — sign, edit (text/highlight/draw), page numbers, watermark
- **Convert** — images to PDF, PDF to images

## Stack

- Next.js 16 (App Router · Turbopack) · React 19 · TypeScript · Tailwind CSS v4
- `pdf-lib`, `pdfjs-dist` v6, `lucide-react`, `jszip`
- `next/og` for OG/Twitter images (per-tool variants)

## Commands

```bash
pnpm dev      # local dev
pnpm build    # production build
pnpm start    # serve production build
pnpm lint     # ESLint
```

## Configuration

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` (default `https://pdfany.app`).
It feeds `SITE.domain`, which drives canonical URLs, sitemap, robots.txt and OG image URLs.

> **Note:** This is Next.js 16 with breaking API changes. Read the guides in `node_modules/next/dist/docs/` before writing code.

## Credits

Built by [Dhiraj Arya](https://dhirajarya.in).

- [GitHub](https://github.com/dhirajaryaa) · [BlogDrop](https://blogdrop.in) · [LowPDF](https://lowpdf.dhirajarya.in) · [LinkedIn](https://linkedin.com/in/dhirajarya01)
- Contact / bug reports: `hello@dhirajarya.in`