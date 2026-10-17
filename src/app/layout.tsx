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

import { getSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const meta = settings.site_meta || DEFAULT_SITE_SETTINGS.site_meta!;
  return {
    metadataBase: new URL("https://heca-official.vercel.app"),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords ? meta.keywords.split(",").map(k => k.trim()) : ["HECA"],
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: "https://heca-official.vercel.app",
      siteName: "HECA",
      images: [
        {
          url: meta.og_image,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.og_image],
    },
  };
}

import SplashScreen from "@/components/SplashScreen";

import { CustomerProvider } from "@/context/CustomerContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const announcement = settings.announcement;

  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HECA",
    url: "https://heca-official.vercel.app",
    logo: "https://heca-official.vercel.app/icon.jpg",
    contactPoint: {
      "@type": "ContactPoint",
      email: "care@heca.com",
      contactType: "customer service",
    },
  };

  return (
    <html lang="en" className={`${inter.variable} ${bodoniModa.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="antialiased font-sans bg-heca-bg text-heca-primary">
        {announcement?.enabled && (
          <div
            className="w-full text-center text-[10px] uppercase tracking-[0.2em] py-2 px-4 sticky top-0 z-50 transition-colors"
            style={{
              backgroundColor: announcement.bg_color || "#111111",
              color: announcement.text_color || "#EBE6DF",
            }}
          >
            {announcement.link ? (
              <a href={announcement.link} className="underline underline-offset-2 hover:opacity-80 transition-opacity">
                {announcement.text}
              </a>
            ) : (
              announcement.text
            )}
          </div>
        )}
        <SplashScreen />
        <ProductProvider>
          <CustomerProvider>
            <CartProvider>
              {children}
              <Footer homeContent={settings.home_content} footerSettings={settings.footer} />
              <QuickViewDrawer />
              <HelpDrawer />
              <MarketplaceModal />
              <NavigationDrawer />
            </CartProvider>
          </CustomerProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
