import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { ToastProvider } from "@/components/ui/toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";

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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

// Applies the saved (or system) theme before first paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var d=document.documentElement,s=localStorage.getItem('theme'),m=window.matchMedia('(prefers-color-scheme: dark)');var a=function(t){d.classList.toggle('dark',t==='dark')};a(s||(m.matches?'dark':'light'));if(!s&&m.addEventListener){m.addEventListener('change',function(e){if(!localStorage.getItem('theme'))a(e.matches?'dark':'light')})}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GT46XXZKZQ";
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">
        <ToastProvider>
          <Providers>{children}</Providers>
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId={gaId} />
      </body>
    </html>
  );
}
