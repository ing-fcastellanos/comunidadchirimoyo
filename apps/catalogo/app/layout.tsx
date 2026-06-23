import type { Metadata } from "next";
import { serif, sans } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fauna.chirimoyo.org"),
  title: {
    default: "Guía de Fauna del Chirimoyo",
    template: "%s | Guía de Fauna del Chirimoyo",
  },
  description:
    "Catálogo de la fauna (aves, anfibios y reptiles) del humedal de Chirimoyo, Orizaba, Veracruz.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    siteName: "Guía de Fauna del Chirimoyo",
    description:
      "Catálogo de la fauna (aves, anfibios y reptiles) del humedal de Chirimoyo, Orizaba, Veracruz.",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Humedal de Chirimoyo, Orizaba, Veracruz.",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
