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
  Lock,
  Unlock,
  type LucideIcon,
} from "lucide-react";

function make(Icon: LucideIcon) {
  return (className: string) => <Icon className={className} aria-hidden />;
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
  protect: make(Lock),
  unlock: make(Unlock),
};

export function ToolIcon({ slug, className }: { slug: string; className?: string }) {
  const fn = iconMap[slug];
  return fn ? fn(className ?? "h-5 w-5") : null;
}