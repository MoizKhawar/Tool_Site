import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToolForge",
  description:
    "A focused toolkit for image resizing and conversion, metadata and geotag editing, and basic website design and SEO utilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-100">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-semibold tracking-[0.24em] text-cyan-200 uppercase">
              ToolForge
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <Link className="rounded-full px-3 py-2 transition hover:bg-white/[0.08] hover:text-white" href="/image-tool">
                Image tool
              </Link>
              <Link className="rounded-full px-3 py-2 transition hover:bg-white/[0.08] hover:text-white" href="/metadata-tool">
                Metadata
              </Link>
              <Link className="rounded-full px-3 py-2 transition hover:bg-white/[0.08] hover:text-white" href="/seo-design-tool">
                SEO + design
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
