import type { Metadata } from "next";
import { CATEGORIES, SITE, TOOLS } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "All PDF Tools",
  description:
    "The full list of free, private PDF tools that run 100% in your browser — merge, split, rotate, sign, edit, convert, number pages and more. Files never leave your device.",
  alternates: { canonical: `${SITE.domain}/tools` },
};

export default function ToolsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All PDF tools</h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          {TOOLS.length} free tools for organizing, annotating and converting PDFs. Everything runs in
          your browser — no uploads, so your files never leave your device.
        </p>
      </div>
      <div className="mt-10 space-y-12">
        {CATEGORIES.map((category) => {
          const tools = TOOLS.filter((t) => t.category === category.id);
          return (
            <section key={category.id}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                {category.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-14 rounded-2xl border border-border bg-surface-muted/50 p-6 text-center text-[14px] leading-relaxed text-muted">
        {SITE.brand} runs {TOOLS.length} {TOOLS.length === 1 ? "tool" : "tools"} entirely in your browser
        using open-source libraries. There is no server processing, no account and no tracking — the
        privacy policy explains exactly what is (and is not) collected.
      </p>
    </main>
  );
}