import type { MetadataRoute } from "next";
import { SITE, TOOLS } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    {
      url: SITE.domain,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
  for (const tool of TOOLS) {
    urls.push({
      url: `${SITE.domain}/${tool.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }
  urls.push({
    url: `${SITE.domain}/privacy`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.4,
  });
  return urls;
}