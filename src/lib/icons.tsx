import {
  Combine,
  Scissors,
  FileSearch,
  Trash2,
  Shuffle,
  CopyPlus,
  RotateCw,
  ArrowDownUp,
  FilePlus2,
  FileOutput,
  PenLine,
  Pencil,
  FileImage,
  FileType2,
  Hash,
  Droplet,
  type LucideIcon,
} from "lucide-react";

function make(Icon: LucideIcon) {
  const Glyph = (className: string) => <Icon className={className} aria-hidden />;
  Glyph.displayName = `ToolGlyph_${Icon.displayName ?? Icon.name ?? "Icon"}`;
  return Glyph;
}

export const iconMap: Record<string, (className: string) => React.ReactNode> = {
  merge: make(Combine),
  split: make(Scissors),
  extract: make(FileSearch),
  delete: make(Trash2),
  reorder: make(Shuffle),
  duplicate: make(CopyPlus),
  rotate: make(RotateCw),
  reverse: make(ArrowDownUp),
  insert: make(FilePlus2),
  range: make(FileOutput),
  sign: make(PenLine),
  edit: make(Pencil),
  "images-to-pdf": make(FileImage),
  "pdf-to-images": make(FileType2),
  "page-numbers": make(Hash),
  watermark: make(Droplet),
};

export function ToolIcon({ slug, className }: { slug: string; className?: string }) {
  const fn = iconMap[slug];
  return fn ? fn(className ?? "h-5 w-5") : null;
}