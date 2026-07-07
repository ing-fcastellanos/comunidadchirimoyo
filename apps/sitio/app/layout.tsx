import type { Metadata } from "next";
import { serif, sans } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chirimoyo.org"),
  title: {
    default: "Comunidad Chirimoyo",
    template: "%s | Comunidad Chirimoyo",
  },
  description:
    "Vecinos y ecologistas en defensa del humedal de Chirimoyo, Orizaba, Veracruz.",
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
    siteName: "Comunidad Chirimoyo",
    description:
      "Vecinos y ecologistas en defensa del humedal de Chirimoyo, Orizaba, Veracruz.",
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
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Comunidad Chirimoyo",
      template: "%s | Comunidad Chirimoyo",
    },
    description:
      "Vecinos y ecologistas en defensa del humedal de Chirimoyo, Orizaba, Veracruz.",
    images: ["/og-default.jpg"],
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
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-forest-deep focus:px-5 focus:py-3 focus:text-[15px] focus:font-semibold focus:text-paper-card focus:shadow-card focus:outline-none focus:ring-4 focus:ring-mint/40"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
