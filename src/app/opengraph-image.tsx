import { buildOgImage } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PDFAny — Free, private, in-browser PDF tools";

export default function OpengraphImage() {
  return buildOgImage({
    titleLines: ["Merge. Split. Rotate.", "Sign. Edit."],
    subtitle: "Free, private PDF tools that run 100% in your browser.",
  });
}