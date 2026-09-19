export type Category = "organize" | "convert" | "annotate";

export interface ToolMeta {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  keywords: string[];
  how: string;
  steps: string[];
  category: Category;
  categoryLabel: string;
  accent: string;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfany.app").replace(/\/+$/, "");

export const SITE = {
  name: "PDFAny",
  brand: "PDFAny",
  domain: SITE_URL,
  tagline: "Free, private PDF tools that run 100% in your browser.",
  description:
    "Merge, split, rotate, sign and edit PDFs for free. Everything is processed locally on your device — your documents never leave your computer.",
};

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "organize", label: "Organize" },
  { id: "annotate", label: "Annotate" },
  { id: "convert", label: "Convert" },
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
    how: "How to merge PDFs",
    steps: [
      "Open the Merge PDF tool and add the files you want to combine — drag and drop them, or pick them from your device.",
      "Arrange the files into the order you want them to appear in the final document.",
      "Click merge and download the combined PDF. It is assembled entirely on your device.",
    ],
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
    how: "How to split a PDF",
    steps: [
      "Open the Split PDF tool and load your PDF.",
      "Pick a mode: turn every page into its own file, or divide the document by custom page ranges.",
      "Type ranges like 1-3, 5 or 8-10 to separate it exactly how you need.",
      "Download the split files — each one is a valid PDF produced locally.",
    ],
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
    how: "How to extract pages from a PDF",
    steps: [
      "Load your PDF in the Extract Pages tool.",
      "Select the thumbnails of the pages you want to keep — or type their page numbers.",
      "Click extract to build a fresh PDF from just those pages.",
      "Download the result. The original file is never changed on your device.",
    ],
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
    how: "How to delete pages from a PDF",
    steps: [
      "Open the Delete Pages tool and select your PDF.",
      "Click the pages you no longer need — they are marked as you select them.",
      "Export the cleaned-up document and download it.",
      "The original PDF stays untouched on your device.",
    ],
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
    how: "How to reorder PDF pages",
    steps: [
      "Load the PDF into the Reorder Pages tool.",
      "Drag the page thumbnails to rearrange them into the order you want.",
      "Download the reordered document once the sequence looks right.",
    ],
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
    how: "How to duplicate pages in a PDF",
    steps: [
      "Open the Duplicate Pages tool and load a PDF.",
      "Choose the page or pages you want to copy.",
      "Set how many extra copies each selected page should get.",
      "Download the updated document with the duplicates added.",
    ],
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
    how: "How to rotate PDF pages",
    steps: [
      "Open the Rotate Pages tool with your PDF.",
      "Select the pages to turn — or rotate the whole document.",
      "Choose 90°, 180° or 270° to fix the orientation.",
      "Download the corrected PDF.",
    ],
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
    how: "How to reverse a PDF",
    steps: [
      "Load a PDF in the Reverse PDF tool.",
      "Click reverse — the tool flips the whole page order instantly.",
      "Download the result, now with the last page first.",
    ],
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
    how: "How to insert pages into a PDF",
    steps: [
      "Open the Insert Pages tool and add your main PDF.",
      "Choose a position, then insert a blank page or pages taken from another PDF.",
      "Set the page size for any blank pages first, if needed.",
      "Download the finished document.",
    ],
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
    how: "How to export a page range from a PDF",
    steps: [
      "Open the Page Range Export tool and load your PDF.",
      "Enter the start and end page you want to keep.",
      "Export that exact range as its own PDF file.",
    ],
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
    how: "How to sign a PDF",
    steps: [
      "Open the Sign PDF tool and load the document.",
      "Draw your signature in the pad, then resize or reposition it as needed.",
      "Drag it onto the page wherever it has to go.",
      "Download the signed PDF.",
    ],
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
    how: "How to edit a PDF",
    steps: [
      "Open the Edit PDF tool with your document.",
      "Use the toolbar to add text, draw freehand or highlight anywhere on a page.",
      "Position and style your annotations until they look right.",
      "Download the edited PDF.",
    ],
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
    how: "How to convert images to a PDF",
    steps: [
      "Open the Images to PDF tool.",
      "Add JPG, PNG or WebP files — several images at once is fine.",
      "Each image becomes a separate full-size page, in the order you added them.",
      "Download the combined PDF.",
    ],
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
    how: "How to convert a PDF to images",
    steps: [
      "Open the PDF to Images tool with your PDF.",
      "Choose which pages to convert and the image quality.",
      "The tool renders each page as a JPG on your device.",
      "Download the images as a ZIP archive.",
    ],
    category: "convert",
    categoryLabel: "Convert",
    accent: "#34d399",
  },
  {
    slug: "page-numbers",
    name: "Add Page Numbers",
    tagline: "Number every page in seconds",
    description: "Add page numbers to the bottom or top of every page.",
    longDescription:
      "Number every page of your PDF automatically. Pick a starting number and a position — bottom-left, centered, right, or top-right — and download the result.",
    keywords: ["add page numbers", "page numbers pdf", "number pages", "insert page numbers"],
    how: "How to add page numbers to a PDF",
    steps: [
      "Open the Add Page Numbers tool with your PDF.",
      "Pick a starting number and a position — bottom center, a corner, or top-right.",
      "The tool numbers every page automatically.",
      "Download the numbered PDF.",
    ],
    category: "annotate",
    categoryLabel: "Annotate",
    accent: "#eab308",
  },
  {
    slug: "watermark",
    name: "Watermark PDF",
    tagline: "Stamp text across every page",
    description: "Add a semi-transparent text watermark to your document.",
    longDescription:
      "Place a diagonal text watermark such as DRAFT or CONFIDENTIAL across every page of your PDF, with adjustable opacity.",
    keywords: ["watermark pdf", "add watermark", "draft"],
    how: "How to watermark a PDF",
    steps: [
      "Open the Watermark PDF tool with your document.",
      "Type the text you want to stamp, like DRAFT or CONFIDENTIAL.",
      "Adjust the opacity — the tool places it diagonally across every page.",
      "Download the watermarked PDF.",
    ],
    category: "annotate",
    categoryLabel: "Annotate",
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