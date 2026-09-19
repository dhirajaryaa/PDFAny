import { TOOLS, TOOL_BY_SLUG } from "@/lib/tools";
import { buildOgImage } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool)
    return buildOgImage({ titleLines: ["PDFAny"], subtitle: "Free, private PDF tools" });
  return buildOgImage({
    titleLines: [tool.name],
    subtitle: tool.tagline,
    accent: tool.accent,
  });
}