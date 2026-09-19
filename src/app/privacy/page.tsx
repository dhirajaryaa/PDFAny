import type { Metadata } from "next";
import { Lock, PackageOpen, Server, ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "PDFAny is 100% client-side. Files never leave your device — no uploads, no tracking, no analytics, no accounts.",
};

const sections = [
  {
    icon: ShieldCheck,
    title: "Your files never leave your device",
    body: (
      <>
        <p>
          {SITE.brand} is a client-side toolkit. There is no backend, no file server, and no processing
          happens anywhere but your own browser. When you open a PDF it is read by JavaScript ({" "}
          <code>pdf-lib</code> and <code>pdfjs-dist</code>) running locally on your machine, and the
          resulting document is saved back to your device by your browser&apos;s download mechanism.
        </p>
        <p>There is quite literally nowhere for your files to go — even if we wanted to see them, we could not.</p>
      </>
    ),
  },
  {
    icon: PackageOpen,
    title: "The full architecture, plain and simple",
    body: (
      <>
        <p>Everything you see on the site is a static Next.js application. Every tool runs through this flow:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            You pick a PDF (or image) in your browser — it is read from your disk into memory.
          </li>
          <li>
            The document is processed locally by libraries bundled into the page. Nothing is transmitted over
            the network at any point.
          </li>
          <li>
            The result is generated client-side and downloaded to your device, or shown on screen.
          </li>
        </ol>
        <p>
          The only server-side work is serving the web pages themselves (static hosting). The server never
          receives the contents of your documents, never sees the names of your files, and stores nothing.
        </p>
      </>
    ),
  },
  {
    icon: Lock,
    title: "What we collect",
    body: (
      <>
        <p><strong>Nothing.</strong> {SITE.brand} has:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>no accounts, logins, or profiles</li>
          <li>no analytics, tracking pixels, or fingerprinting</li>
          <li>no advertising</li>
          <li>no cookies — not even a consent banner&apos;s worth</li>
          <li>no logging of your activity</li>
        </ul>
        <p>
          No data is collected, stored, sold, or shared with anyone. There is no data to delete because
          there is no data to begin with.
        </p>
      </>
    ),
  },
  {
    icon: Server,
    title: "What is stored on your device",
    body: (
      <>
        <p>
          The only thing your browser keeps is your <em>theme preference</em> (light or dark), saved in{" "}
          <code>localStorage</code> on your own device. It stays in your browser and is never sent anywhere.
          The PDFs you work on are never persisted — they exist only in the page&apos;s memory while you use it.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-2">Privacy policy</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Private by architecture
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          There is nothing to hide because your documents are never sent anywhere. This page explains how
          that works and what the site does — and does not — collect.
        </p>
      </div>

      <div className="mt-10 grid gap-6">
        {sections.map(({ icon: Icon, title, body }) => (
          <section key={title} className="rounded-2xl border border-border bg-surface-muted/50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground">
                <Icon className="h-4 w-4" />
              </span>
              {title}
            </h2>
            <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-muted">{body}</div>
          </section>
        ))}

        <section className="rounded-2xl border border-border bg-surface-muted/50 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Third parties and links</h2>
          <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-muted">
            <p>
              Fonts are bundled with the site and are not loaded from a third-party network. The link
              preview (Open Graph) image includes the author&apos;s public GitHub avatar, fetched from
              github.com when a preview is generated — this is a public image and contains no site data.
            </p>
            <p>
              The site links out to the author&apos;s portfolio, GitHub, X, LinkedIn and email. Those are
              external sites with their own policies; opening a link is the only way your browser contacts
              them.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface-muted/50 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Contact</h2>
          <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-muted">
            <p>
              Questions about this policy, a security concern, or anything else? Reach out directly — no
              forms, no middlemen:
            </p>
            <p>
              <a className="font-medium text-foreground underline-offset-4 hover:underline" href="mailto:hello@dhirajarya.in">
                hello@dhirajarya.in
              </a>
            </p>
          </div>
        </section>

        <p className="pt-2 text-xs text-muted-2">
          This policy covers {SITE.domain}. It was last updated on {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}.
        </p>
      </div>
    </div>
  );
}