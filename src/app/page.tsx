'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, Zap, WifiOff } from "lucide-react";
import { TOOLS, CATEGORIES, type Category } from "@/lib/tools";
import { ToolIcon } from "@/lib/icons";

const TRUST = [
  { icon: ShieldCheck, label: "Your files never leave your device" },
  { icon: Zap, label: "Fast — processes locally, no uploads" },
  { icon: WifiOff, label: "Works even with a weak connection" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const inCat = category === "all" || t.category === category;
      const inQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q));
      return inCat && inQuery;
    });
  }, [query, category]);

  const grouped = useMemo(() => {
    if (category !== "all") {
      return [{ label: CATEGORIES.find((c) => c.id === category)!.label, tools: filtered }];
    }
    return CATEGORIES.map((c) => ({
      label: c.label,
      tools: filtered.filter((t) => t.category === c.id),
    })).filter((g) => g.tools.length > 0);
  }, [filtered, category]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 sm:px-8">
      <section className="pt-14 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              100% in your browser — nothing is ever uploaded
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Every PDF tool you need.
              <br />
              <span className="text-accent">Private by default.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Merge, split, rotate, sign and edit PDFs free. All processing happens
              locally on your device — so your documents never leave your computer.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              {TRUST.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                  <t.icon className="h-4 w-4 text-accent" />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG illustration */}
            <img
              src="/illustrations/documents.svg"
              alt="Illustration of stacked documents"
              className="h-72 w-72 xl:h-80 xl:w-80"
              loading="eager"
            />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools… e.g. merge, rotate, signature"
              className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-4 text-sm outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-accent"
            />
          </label>
        </div>
      </section>

      <section className="mt-10 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            category === "all"
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-surface text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              category === c.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </section>

      <div className="mt-12 space-y-12">
        {grouped.length === 0 ? (
          <p className="py-12 text-center text-muted">No tools match your search.</p>
        ) : (
          grouped.map((group) => (
            <section key={group.label}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/${tool.slug}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${tool.accent}1a`, color: tool.accent }}
                      >
                        <ToolIcon slug={tool.slug} className="h-5 w-5" />
                      </span>
                      <span className="text-muted-2 transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold tracking-tight">{tool.name}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{tool.tagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}