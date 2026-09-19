import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-[15px] text-muted">
          That page doesn&apos;t exist. Try one of the PDF tools instead.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button>Back to all tools</Button>
          </Link>
          <a href="mailto:hello@dhirajarya.in?subject=Broken%20link%20%E2%80%94%20PDFAny">
            <Button variant="outline">Report a broken link</Button>
          </a>
        </div>
      </div>
    </main>
  );
}