import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "SEDC Transformer Monitor | Sudan IoT Dashboard",
  description:
    "Live 3-phase electrical monitoring across 3 SEDC transformer sites in Sudan. React + Next.js rebuild of a 2023 industrial IoT system originally built at GTS Hi-Tech on Node-RED + ThingsBoard.",
  authors: [{ name: "Babakr Hussain" }],
  keywords: ["IoT", "Node-RED", "ThingsBoard", "transformer monitoring", "electrical", "Sudan", "SEDC", "telemetry"],
  openGraph: {
    title: "SEDC Transformer Monitor",
    description: "Live 3-phase electrical monitoring across 3 transformer sites in Sudan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canar-bg">
        <header className="bg-white border-b border-zinc-200 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="size-9 rounded-md bg-canar-blue flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-5 text-white" fill="currentColor">
                  <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold text-zinc-900 leading-tight">SEDC Transformer Monitor</div>
                <div className="text-xs text-zinc-500 leading-tight">Sudan deployment &middot; Rebuild v1.0</div>
              </div>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 font-medium">
                Overview
              </Link>
              <Link href="/about" className="px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 font-medium">
                About
              </Link>
              <a
                href="https://github.com/bekoblast/sedc-transformer-monitor"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-500"
              >
                Source
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-200 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 py-3 text-xs text-zinc-500 flex items-center justify-between flex-wrap gap-2">
            <span>
              Rebuild of the 2023 SEDC transformer monitoring system &middot; Khartoum / Omdurman / Khartoum North.
            </span>
            <span className="font-mono text-zinc-400">Node-RED &rarr; WebSocket &rarr; React</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
