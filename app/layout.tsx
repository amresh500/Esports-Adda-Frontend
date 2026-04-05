import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { LanguageProvider } from "@/lib/LanguageContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

// Noto Sans Devanagari — renders Nepali (Devanagari script) correctly
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Esports Adda | इस्पोर्ट्स अड्डा",
  description: "Nepal's Premier Esports Platform — नेपालको प्रमुख इस्पोर्ट्स प्लेटफर्म",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang is updated dynamically on the client by LanguageContext via document.documentElement.lang
    <html lang="en" className={`${plusJakartaSans.variable} ${notoSansDevanagari.variable}`}>
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
