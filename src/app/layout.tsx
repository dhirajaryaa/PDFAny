import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
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
        url: `${SITE.domain}/opengraph-image`,
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
    images: [`${SITE.domain}/opengraph-image`],
  },
  alternates: {
    canonical: SITE.domain,
  },
  category: "technology",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: [{ url: "/apple-touch-icon.png" }],
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
        <MotionConfig reducedMotion="user">
          <Header />
          {children}
          <Footer />
        </MotionConfig>
        <Analytics />
      </body>
    </html>
  );
}