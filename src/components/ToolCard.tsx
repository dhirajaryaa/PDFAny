"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ToolIcon } from "@/lib/icons";
import type { ToolMeta } from "@/lib/tools";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link
        href={`/${tool.slug}`}
        className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/50"
      >
        <div className="flex items-start justify-between">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.12 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${tool.accent}1a`, color: tool.accent }}
          >
            <ToolIcon slug={tool.slug} className="h-5 w-5" />
          </motion.span>
          <span className="text-muted-2 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        <div>
          <h3 className="font-semibold tracking-tight">{tool.name}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{tool.tagline}</p>
        </div>
      </Link>
    </motion.div>
  );
}