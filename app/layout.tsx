import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { OSShell } from "@/components/shell/OSShell";
import "./globals.css";

// Display: characterful grotesque. Carries the page personality.
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Body + mono: IBM Plex, drawn for an engineering identity. Reads as a real
// instrument face rather than a costume terminal font.
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://orbit-os-mocha.vercel.app";
const DESCRIPTION = "A living system of websites, AI products, experiments, and ideas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ORBIT OS · Keyush Patel",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "ORBIT OS",
    title: "ORBIT OS · Keyush Patel",
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/og/default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORBIT OS · Keyush Patel",
    description: DESCRIPTION,
    images: ["/og/default.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="antialiased">
        <OSShell>{children}</OSShell>
      </body>
    </html>
  );
}
