import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "./service-worker-registration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BudgetChom - Smart Budget Management",
  description: "Track your expenses, manage budgets, and achieve your financial goals with BudgetChom",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BudgetChom",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%233b82f6' width='192' height='192'/><text x='50%' y='50%' font-size='120' font-weight='bold' fill='white' dominant-baseline='middle' text-anchor='middle' font-family='system-ui'>C</text></svg>",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect fill='%233b82f6' width='180' height='180' rx='40'/><text x='50%' y='50%' font-size='108' font-weight='bold' fill='white' dominant-baseline='middle' text-anchor='middle' font-family='system-ui'>C</text></svg>",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-title": "BudgetChom",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BudgetChom" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect fill='%233b82f6' width='180' height='180' rx='40'/><text x='50%' y='50%' font-size='108' font-weight='bold' fill='white' dominant-baseline='middle' text-anchor='middle' font-family='system-ui'>C</text></svg>" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
