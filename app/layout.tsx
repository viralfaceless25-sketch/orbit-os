import type { Metadata } from "next";
import localFont from "next/font/local";
import { OSShell } from "@/components/shell/OSShell";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ORBIT OS — Keyush Patel",
  description: "A living system of websites, AI products, experiments, and ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OSShell>{children}</OSShell>
      </body>
    </html>
  );
}
