"use client";

import { useCallback, useState } from "react";
import { getPdfPageCount } from "@/lib/pdfjs";

export function usePdfFile() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setPageCount(null);
    setError(null);
    setLoading(true);
    getPdfPageCount(f)
      .then(setPageCount)
      .catch(() => setError("Could not read this PDF. It may be corrupted or password-protected."))
      .finally(() => setLoading(false));
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setPageCount(null);
    setError(null);
  }, []);

  return { file, pageCount, error, loading, load, reset };
}