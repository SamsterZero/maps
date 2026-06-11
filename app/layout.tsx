import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
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
  title: "Atlasify - Premium Interactive Map Dashboard",
  description: "A gorgeous, high-performance map dashboard built with MapLibre GL and Next.js.",
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Atlasify - Premium Interactive Map Dashboard",
    description: "A gorgeous, high-performance map dashboard built with MapLibre GL and Next.js.",
    url: "https://yourusername.github.io/maps",
    siteName: "Atlasify",
    images: [
      {
        url: "/maps/icon-512.png", // We will need to add an icon later
        width: 512,
        height: 512,
        alt: "Atlasify Map Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlasify - Premium Interactive Map Dashboard",
    description: "A gorgeous, high-performance map dashboard built with MapLibre GL and Next.js.",
    images: ["/maps/icon-512.png"],
  },
  appleWebApp: {
    title: "Atlasify",
    statusBarStyle: "black-translucent",
    capable: true,
  },
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
