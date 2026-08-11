import type { Metadata } from "next";
import { Inter, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";
import HelpDrawer from "@/components/HelpDrawer";
import MarketplaceModal from "@/components/MarketplaceModal";
import NavigationDrawer from "@/components/NavigationDrawer";
import QuickViewDrawer from "@/components/QuickViewDrawer";

import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HECA | High-Fashion & Minimalist Editorial",
  description: "HECA is a modern luxury fashion brand inspired by minimalist editorial style. Explore our latest collection of premium clothing, dresses, tops, and more.",
  keywords: ["HECA", "Luxury Fashion", "Minimalist", "Editorial", "Designer Clothes", "Premium Brand"],
  openGraph: {
    title: "HECA | High-Fashion & Minimalist Editorial",
    description: "Explore the latest collection of premium clothing, dresses, tops, and more.",
    url: "https://heca-fashion.vercel.app",
    siteName: "HECA",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "HECA Luxury Fashion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HECA | High-Fashion & Minimalist Editorial",
    description: "HECA is a modern luxury fashion brand inspired by minimalist editorial style.",
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80"],
  },
};

import SplashScreen from "@/components/SplashScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bodoniModa.variable}`}>
      <body className="antialiased font-sans bg-heca-bg text-heca-primary">
        <SplashScreen />
        <ProductProvider>
          <CartProvider>
            {children}
            <Footer />
            <QuickViewDrawer />
            <HelpDrawer />
            <MarketplaceModal />
            <NavigationDrawer />
          </CartProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
