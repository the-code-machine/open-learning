import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Initialize Open Sans
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wiki Open Learning",
  description: "Community for open learning projects and events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} font-sans antialiased`}>
        {/* Navbar is placed here so it appears on all pages */}
        <Navbar />
        <main className="pt-20">
          {/* pt-20 adds padding so content doesn't hide behind fixed navbar */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
