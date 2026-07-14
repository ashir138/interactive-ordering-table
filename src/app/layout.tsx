import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { Suspense } from "react";
import PostHogProvider from "@/components/PostHogProvider";
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

// Premium pairing for the tabletop experience:
// Fraunces — an expressive editorial serif for display headings (appetite + warmth).
// Hanken Grotesk — a warm, legible grotesque for UI copy.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pizza3.14 — Tabletop Pizza Ordering",
  description: "Build your perfect pizza, track your order live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${hanken.variable} min-h-screen bg-background antialiased`}
      >
        <Suspense>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
