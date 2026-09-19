import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/tools";
import { ThemeToggle } from "@/components/ThemeToggle";

const BRAND_PATHS: Record<string, string> = {
  github:
    "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

function BrandIcon({ name, className = "h-4 w-4" }: { name: keyof typeof BRAND_PATHS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={BRAND_PATHS[name]} />
    </svg>
  );
}

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
          <Link href="/tools" className="rounded-md px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground">
            Tools
          </Link>
          <Link href="/privacy" className="rounded-md px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground">
            Privacy
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const socials = [
    { label: "GitHub", href: "https://github.com/dhirajaryaa", icon: <BrandIcon name="github" /> },
    { label: "X (Twitter)", href: "https://twitter.com/dhirajarya01", icon: <BrandIcon name="x" /> },
    { label: "LinkedIn", href: "https://linkedin.com/in/dhirajarya01", icon: <BrandIcon name="linkedin" /> },
    { label: "Email", href: "mailto:hello@dhirajarya.in", icon: <Mail className="h-4 w-4" /> },
  ];
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Brand />
          <nav className="flex items-center justify-center gap-1 text-sm text-muted md:justify-end" aria-label="Footer">
            <Link href="/tools" className="rounded-md px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground">
              Tools
            </Link>
            <Link href="/privacy" className="rounded-md px-3 py-1.5 transition-colors hover:bg-surface-muted hover:text-foreground">
              Privacy
            </Link>
          </nav>
          <div className="flex items-center justify-center gap-2">
            {socials.map(({ label, href, icon }) => (
              <a
                key={label}
                aria-label={label}
                title={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-muted text-muted transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-col items-center justify-between gap-1.5 border-t border-border pt-5 text-xs text-muted-2 sm:flex-row">
          <p>
            © {year} {SITE.brand} · Made with <span aria-hidden className="text-danger">♥</span>
            <span className="sr-only">love</span> by Dhiraj Arya
          </p>
          <p>Works offline · Files never leave your device</p>
        </div>
      </div>
    </footer>
  );
}