import Link from "next/link";
import { SITE } from "@/lib/tools";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#logoGrad)" />
      <rect x="2" y="2" width="60" height="60" rx="15" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <text x="32" y="45" fontFamily="Arial, Helvetica, sans-serif" fontSize="36" fontWeight="800" fill="#ffffff" textAnchor="middle">
        P
      </text>
    </svg>
  );
}

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">{SITE.brand}</span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav className="flex items-center gap-1 text-sm text-muted" aria-label="Main">
          <Link href="/" className="rounded-md px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground">
            Tools
          </Link>
          <Link href="/#privacy" className="rounded-md px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground">
            Privacy
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer id="privacy" className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <Brand />
            <p className="max-w-xs text-[13px] leading-relaxed text-muted">{SITE.tagline}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-2">Popular tools</p>
            <ul className="space-y-1.5 text-[13px]">
              <li><Link className="text-muted transition-colors hover:text-foreground" href="/merge">Merge PDF</Link></li>
              <li><Link className="text-muted transition-colors hover:text-foreground" href="/split">Split PDF</Link></li>
              <li><Link className="text-muted transition-colors hover:text-foreground" href="/sign">Sign PDF</Link></li>
              <li><Link className="text-muted transition-colors hover:text-foreground" href="/rotate">Rotate PDF</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-2">Privacy</p>
            <p className="max-w-xs text-[13px] leading-relaxed text-muted">
              100% private. Every PDF tool runs entirely in your browser — your files are never
              uploaded to a server, so they never leave your computer.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-border pt-6 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-2">Built by Dhiraj Arya</p>
            <ul className="space-y-1.5 text-[13px]">
              <li>
                <a className="text-muted transition-colors hover:text-foreground" href="https://dhirajarya.in" rel="noopener noreferrer" target="_blank">
                  Portfolio — dhirajarya.in
                </a>
              </li>
              <li>
                <a className="text-muted transition-colors hover:text-foreground" href="https://github.com/dhirajaryaa" rel="noopener noreferrer" target="_blank">
                  GitHub — github.com/dhirajaryaa
                </a>
              </li>
              <li>
                <a className="text-muted transition-colors hover:text-foreground" href="https://blogdrop.in" rel="noopener noreferrer" target="_blank">
                  BlogDrop — engineering blog reader
                </a>
              </li>
              <li>
                <a className="text-muted transition-colors hover:text-foreground" href="https://lowpdf.dhirajarya.in" rel="noopener noreferrer" target="_blank">
                  LowPDF — private PDF compression
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-2">Need help?</p>
            <ul className="space-y-1.5 text-[13px]">
              <li>
                <a className="text-muted transition-colors hover:text-foreground" href="mailto:hello@dhirajarya.in?subject=Report%20a%20bug%20%E2%80%94%20PDFAny">
                  Report a bug
                </a>
              </li>
              <li>
                <a className="text-muted transition-colors hover:text-foreground" href="mailto:hello@dhirajarya.in?subject=Contact%20%E2%80%94%20PDFAny">
                  Contact me
                </a>
              </li>
              <li>
                <a className="text-muted transition-colors hover:text-foreground" href="https://linkedin.com/in/dhirajarya01" rel="noopener noreferrer" target="_blank">
                  LinkedIn — linkedin.com/in/dhirajarya01
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-2 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.brand} · Made with{" "}
            <span aria-hidden className="text-danger">♥</span>
            <span className="sr-only">love</span> by{" "}
            <a className="font-medium text-muted transition-colors hover:text-foreground" href="https://dhirajarya.in" rel="noopener noreferrer" target="_blank">
              Dhiraj Arya
            </a>
          </p>
          <p>Works offline · No account · No ads · Files never leave your device</p>
        </div>
      </div>
    </footer>
  );
}