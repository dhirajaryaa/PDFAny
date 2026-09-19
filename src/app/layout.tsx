import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { SITE } from "@/lib/tools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: {
    default: `${SITE.name} — Free, private, in-browser PDF tools`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "pdf tools",
    "merge pdf",
    "split pdf",
    "sign pdf",
    "edit pdf",
    "rotate pdf",
    "free pdf tools",
    "pdf online",
    "pdfany",
  ],
  authors: [{ name: "Dhiraj Arya", url: "https://dhirajarya.in" }],
  creator: "Dhiraj Arya",
  publisher: "Dhiraj Arya",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.domain,
    siteName: SITE.name,
    title: `${SITE.name} — Free, private, in-browser PDF tools`,
    description: SITE.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Free, private, in-browser PDF tools`,
    description: SITE.description,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: SITE.domain,
  },
  category: "technology",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.domain,
    description: SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.domain}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: SITE.description,
    url: SITE.domain,
    featureList:
      "Merge PDF, split PDF, sign PDF, edit PDF, rotate PDF and more — all in your browser.",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://dhirajarya.in/#dhirajarya",
    name: "Dhiraj Arya",
    url: "https://dhirajarya.in",
    sameAs: [
      "https://github.com/dhirajaryaa",
      "https://twitter.com/dhirajarya01",
      "https://linkedin.com/in/dhirajarya01",
      "https://youtube.com/@dhirajaryaa",
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',!!d);}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MotionConfig reducedMotion="user">
          <Header />
          {children}
          <Footer />
        </MotionConfig>
      </body>
    </html>
  );
}