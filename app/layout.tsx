import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari, Russo_One, Chakra_Petch } from "next/font/google";
import { LanguageProvider } from "@/lib/LanguageContext";
import { AuthProvider } from "@/lib/AuthContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const russoOne = Russo_One({
  subsets: ["latin"],
  variable: "--font-russo-one",
  weight: "400",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-chakra-petch",
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="en" className={`${plusJakartaSans.variable} ${notoSansDevanagari.variable} ${russoOne.variable} ${chakraPetch.variable}`}>
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
