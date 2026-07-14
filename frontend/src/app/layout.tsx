import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "proofStack | Evidence-Based AI Resume Intelligence Platform",
  description:
    "Evaluate candidate resume fit based on credible evidence of actual skill usage rather than keyword matching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#020617] text-[#f8fafc] font-sans">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
