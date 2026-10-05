import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { APP_NAME, APP_TAGLINE, PWA_ICONS } from "@/lib/version";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const prestigeSerif = Source_Serif_4({
  variable: "--font-prestige",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_TAGLINE} Learn one move at a time, then analyze the position yourself.`,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: PWA_ICONS.favicon, sizes: "32x32", type: "image/png" },
      { url: PWA_ICONS.icon192, sizes: "192x192", type: "image/png" },
      { url: PWA_ICONS.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: PWA_ICONS.appleTouch,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#040406",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${prestigeSerif.variable} h-full antialiased`}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: "html,body{background:#040406;color:#f3ebe0}",
          }}
        />
      </head>
      <body className="app-body bg-[#040406] text-[#f3ebe0]">
        <AuthProvider>
          <RegisterServiceWorker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
