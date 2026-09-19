"use client";

import { useRef, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { PageThumb } from "./PageThumb";

type Mode = "select" | "reorder" | "static";

interface Props {
  file: File;
  order: number[]; // page indices (0-based) in display order
  mode?: Mode;
  selected?: Set<number>;
  onToggle?: (index: number) => void;
  onReorder?: (order: number[]) => void;
  onCellClick?: (index: number) => void;
  badge?: (index: number) => ReactNode;
  cellClassName?: string;
}

export function PageGrid({
  file,
  order,
  mode = "static",
  selected,
  onToggle,
  onReorder,
  onCellClick,
  badge,
  cellClassName = "",
}: Props) {
  const dragFrom = useRef<number | null>(null);

  function move(from: number, to: number) {
    if (!onReorder || from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {order.map((pageIdx, pos) => {
        const isSelected = selected?.has(pageIdx) ?? false;
        return (
          <div
            key={`${pageIdx}-${pos}`}
            draggable={mode === "reorder"}
            onDragStart={
              mode === "reorder"
                ? (e) => {
                    dragFrom.current = pos;
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(pos));
                    if (e.currentTarget instanceof HTMLElement)
                      e.currentTarget.style.opacity = "0.4";
                  }
                : undefined
            }
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement)
                e.currentTarget.style.opacity = "";
              dragFrom.current = null;
            }}
            onDragOver={
              mode === "reorder"
                ? (e) => {
                    e.preventDefault();
                    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                  }
                : undefined
            }
            onDrop={
              mode === "reorder"
                ? (e) => {
                    e.preventDefault();
                    const from =
                      dragFrom.current ?? parseInt(e.dataTransfer.getData("text/plain"), 10);
                    if (!Number.isNaN(from)) move(from, pos);
                    dragFrom.current = null;
                  }
                : undefined
            }
            onClick={
              mode === "select" && onToggle
                ? () => onToggle(pageIdx)
                : onCellClick
                  ? () => onCellClick(pageIdx)
                  : undefined
            }
            className={`group relative overflow-hidden rounded-xl border border-border bg-surface transition-shadow ${
              mode === "select" && onToggle
                ? "cursor-pointer hover:shadow-md"
                : mode === "reorder"
                  ? "cursor-grab active:cursor-grabbing"
                  : ""
            } ${isSelected ? "ring-2 ring-accent border-accent" : ""} ${cellClassName}`}
            role={mode === "select" ? "button" : mode === "reorder" ? "listitem" : undefined}
            aria-pressed={mode === "select" ? isSelected : undefined}
          >
            <PageThumb file={file} pageIndex={pageIdx} />
            {isSelected ? (
              <div className="pointer-events-none absolute inset-0 bg-accent-soft/60" />
            ) : null}
            <div className="pointer-events-none absolute left-1.5 top-1.5 flex items-center gap-1">
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-semibold ${
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface/90 text-muted"
                }`}
              >
                {pageIdx + 1}
              </span>
              {badge ? badge(pageIdx) : null}
            </div>
            {mode === "select" ? (
              <div
                className={`pointer-events-none absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-accent bg-accent"
                    : "border-border bg-surface/90"
                }`}
                aria-hidden
              >
                {isSelected ? (
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent-foreground">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </div>
            ) : null}
            {mode === "reorder" ? (
              <div className="pointer-events-none absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-surface/90 text-muted">
                <GripVertical className="h-3.5 w-3.5" />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}