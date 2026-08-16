import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FinancialStoreProvider } from "@/context/financial-store";

export const metadata: Metadata = {
  title: "FNA Pro | Mobile-First Financial Needs Analysis Platform",
  description: "Comprehensive financial needs analysis, net worth tracking, and protection shortfall diagnostic platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FNA Pro",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f2744",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white"
      >
        <FinancialStoreProvider>
          {children}
        </FinancialStoreProvider>
      </body>
    </html>
  );
}
