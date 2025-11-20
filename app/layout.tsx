import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/components/ReduxProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
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
  title: "Pika Casino - Games Lobby",
  description: "Browse and search through our collection of casino games",
  keywords: ["casino", "games", "slots", "poker", "blackjack", "roulette"],
  openGraph: {
    title: "Pika Casino - Games Lobby",
    description: "Browse and search through our collection of casino games",
    type: "website",
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
        <ErrorBoundary>
          <ReduxProvider>{children}</ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
