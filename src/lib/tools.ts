export type Category =
  | "organize"
  | "convert"
  | "secure"
  | "annotate";

export interface ToolMeta {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  keywords: string[];
  category: Category;
  categoryLabel: string;
  accent: string;
}

export const SITE = {
  name: "PDFAny",
  brand: "PDFAny",
  domain: "https://pdfany.app",
  tagline: "Free, private PDF tools that run 100% in your browser.",
  description:
    "Merge, split, rotate, sign and edit PDFs for free. Everything is processed locally on your device — your documents never leave your computer.",
};

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "organize", label: "Organize" },
  { id: "annotate", label: "Annotate" },
  { id: "convert", label: "Convert" },
  { id: "secure", label: "Secure" },
];

export const TOOLS: ToolMeta[] = [
  {
    slug: "merge",
    name: "Merge PDF",
    tagline: "Combine PDFs into one file",
    description: "Join multiple PDF files into a single document in any order.",
    longDescription:
      "Combine several PDF files into one document. Add files, drag them into the order you want, then merge — all in your browser.",
    keywords: ["merge pdf", "combine pdf", "join pdf", "concatenate pdf"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#4f46e5",
  },
  {
    slug: "split",
    name: "Split PDF",
    tagline: "Break a PDF into separate files",
    description: "Split every page into its own PDF, or divide by custom page ranges.",
    longDescription:
      "Extract each page into an individual PDF file, or split a document into multiple parts using custom page ranges like 1-3, 5, 8-10.",
    keywords: ["split pdf", "separate pages", "divide pdf", "split into files"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#0ea5e9",
  },
  {
    slug: "extract",
    name: "Extract Pages",
    tagline: "Pull certain pages into a new PDF",
    description: "Pick the exact pages you want and export them as a fresh PDF.",
    longDescription:
      "Select specific pages from a PDF and export only those pages as a brand-new document. Perfect for pulling a cover page or a signature page.",
    keywords: ["extract pages", "extract pdf", "pull pages", "copy pages"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#8b5cf6",
  },
  {
    slug: "delete",
    name: "Delete Pages",
    tagline: "Remove unwanted pages instantly",
    description: "Select the pages you no longer need and remove them in one click.",
    longDescription:
      "Remove unwanted pages from your PDF. Click the pages to remove, then export the cleaned-up document.",
    keywords: ["delete pages pdf", "remove pages", "delete page from pdf"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#ef4444",
  },
  {
    slug: "reorder",
    name: "Reorder Pages",
    tagline: "Drag pages into the right order",
    description: "Rearrange PDF pages with simple drag and drop.",
    longDescription:
      "Put your pages in the perfect order. Drag thumbnails to rearrange them within the document.",
    keywords: ["reorder pages", "rearrange pdf", "move pages"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#f59e0b",
  },
  {
    slug: "duplicate",
    name: "Duplicate Pages",
    tagline: "Copy pages within a document",
    description: "Duplicate any page, or add several copies after it.",
    longDescription:
      "Duplicate one or more pages inside your PDF, and choose how many extra copies each page gets.",
    keywords: ["duplicate pages pdf", "copy pages", "repeat page"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#ec4899",
  },
  {
    slug: "rotate",
    name: "Rotate Pages",
    tagline: "Fix page orientation",
    description: "Rotate single pages or the whole document by 90, 180 or 270 degrees.",
    longDescription:
      "Rotate selected pages clockwise or counter-clockwise in 90 degree steps to fix scanned or camera photos.",
    keywords: ["rotate pdf", "rotate pages", "turn page"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#10b981",
  },
  {
    slug: "reverse",
    name: "Reverse PDF",
    tagline: "Flip the entire page order",
    description: "Reverse the order of every page in your PDF.",
    longDescription:
      "Flip the whole document so the last page becomes the first — handy for reversing scanned stacks.",
    keywords: ["reverse pdf", "flip order", "reverse pages"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#fb923c",
  },
  {
    slug: "insert",
    name: "Insert Pages",
    tagline: "Add blank or existing pages",
    description: "Insert blank pages or pages from another PDF at any position.",
    longDescription:
      "Add blank pages in any size, or merge pages from a second PDF into the first at the position you choose.",
    keywords: ["insert pages pdf", "add blank pages", "insert blank page"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#06b6d4",
  },
  {
    slug: "range",
    name: "Page Range Export",
    tagline: "Export a specific page range",
    description: "Export pages 1–5, or any continuous range, as a new PDF.",
    longDescription:
      "Type a start and end page and export that exact range as its own PDF file.",
    keywords: ["export page range", "page range pdf", "save range"],
    category: "organize",
    categoryLabel: "Organize",
    accent: "#6366f1",
  },
  {
    slug: "sign",
    name: "Sign PDF",
    tagline: "Draw and place your signature",
    description: "Draw your signature and place it anywhere on the PDF.",
    longDescription:
      "Draw a signature with your mouse, trackpad or finger, resize it, and drop it onto any page of your document.",
    keywords: ["sign pdf", "e-sign", "electronic signature", "signature"],
    category: "annotate",
    categoryLabel: "Annotate",
    accent: "#22c55e",
  },
  {
    slug: "edit",
    name: "Edit PDF",
    tagline: "Add text, drawings & highlights",
    description: "Annotate your PDF with text boxes, freehand drawings and highlights.",
    longDescription:
      "Add editable text, draw freehand, highlight passages and sketch shapes directly on any page of your PDF.",
    keywords: ["edit pdf", "annotate pdf", "add text to pdf", "highlight pdf"],
    category: "annotate",
    categoryLabel: "Annotate",
    accent: "#a855f7",
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    tagline: "Turn JPG, PNG and WebP into a PDF",
    description: "Convert a batch of images into a single PDF document.",
    longDescription:
      "Combine JPG, PNG or WebP images into one PDF. Each image becomes a full-size page, one image per page.",
    keywords: ["jpg to pdf", "images to pdf", "png to pdf", "image to pdf"],
    category: "convert",
    categoryLabel: "Convert",
    accent: "#f472b6",
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    tagline: "Export PDF pages as JPG images",
    description: "Convert every PDF page into a high-quality JPG image.",
    longDescription:
      "Render each page of your PDF as a crisp JPG image and download them all as a ZIP archive.",
    keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpg", "pdf to png"],
    category: "convert",
    categoryLabel: "Convert",
    accent: "#34d399",
  },
  {
    slug: "protect",
    name: "Protect PDF",
    tagline: "Lock PDFs with a password",
    description: "Add a password so only people you trust can open or edit it.",
    longDescription:
      "Encrypt your PDF with a password. Restrict printing and copying too if you want.",
    keywords: ["password protect pdf", "encrypt pdf", "lock pdf", "pdf password"],
    category: "secure",
    categoryLabel: "Secure",
    accent: "#eab308",
  },
  {
    slug: "unlock",
    name: "Unlock PDF",
    tagline: "Remove password protection",
    description: "Unlock a password-protected PDF and save a plain copy.",
    longDescription:
      "Open a password-protected PDF on your own device and save an unlocked copy. The password is only used locally.",
    keywords: ["unlock pdf", "remove password pdf", "decrypt pdf"],
    category: "secure",
    categoryLabel: "Secure",
    accent: "#14b8a6",
  },
];

export const TOOL_BY_SLUG = Object.fromEntries(TOOLS.map((t) => [t.slug, t])) as Record<
  string,
  ToolMeta
>;

export function toolSlugMeta(slug?: string): ToolMeta | null {
  if (!slug) return null;
  return TOOL_BY_SLUG[slug] ?? null;
}