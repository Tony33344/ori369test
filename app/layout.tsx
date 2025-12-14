import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/i18n";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ORI 369 - Vaš most med znanostjo in energijo",
  description: "V ORI 369 združujemo vrhunske terapevtske pristope, najnovejše tehnologije in globoko razumevanje frekvenc 3-6-9 za ravnovesje telesa, uma in duha.",
  keywords: "terapija, sound healing, retreats, wellness, zdravje, Maribor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sl">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LanguageProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <Header />
            <CartDrawer />
            <main className="pt-16">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
