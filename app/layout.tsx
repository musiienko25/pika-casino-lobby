import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/components/ReduxProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import StructuredData from "@/components/StructuredData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pika-casino-lobby.vercel.app';
const siteName = 'Pika Casino';
const siteDescription = 'Browse and search through our collection of casino games including slots, poker, blackjack, and roulette. Discover your favorite games and start playing today!';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Games Lobby`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "casino",
    "games",
    "slots",
    "poker",
    "blackjack",
    "roulette",
    "online casino",
    "casino games",
    "gambling",
    "betting",
  ],
  authors: [{ name: "Pika Casino" }],
  creator: "Pika Casino",
  publisher: "Pika Casino",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: `${siteName} - Games Lobby`,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${siteName} - Games Lobby`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Games Lobby`,
    description: siteDescription,
    images: [`${siteUrl}/og-image.jpg`],
    creator: "@pikacasino",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
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
        <StructuredData />
        <ErrorBoundary>
          <ReduxProvider>{children}</ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
