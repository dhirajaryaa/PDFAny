import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOL_BY_SLUG, SITE, type ToolMeta } from "@/lib/tools";
import { ToolShell } from "@/components/tools/ToolShell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) return {};
  const url = `${SITE.domain}/${slug}`;
  return {
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE.name,
      title: `${tool.name} — ${tool.tagline}`,
      description: tool.description,
      images: [
        {
          url: `${url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} — ${tool.tagline}`,
      description: tool.description,
      images: [`${url}/twitter-image`],
    },
  };
}

function jsonLd(tool: ToolMeta): string {
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: tool.longDescription,
      url: `${SITE.domain}/${tool.slug}`,
      image: `${SITE.domain}/${tool.slug}/opengraph-image`,
      browserRequirements: "Requires JavaScript. Runs fully in the browser.",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE.name,
          item: SITE.domain,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: tool.name,
          item: `${SITE.domain}/${tool.slug}`,
        },
      ],
    },
  ]);
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(tool) }}
      />
      <ToolShell slug={slug} />
    </>
  );
}