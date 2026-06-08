import type { Metadata } from "next";
import { serif, sans } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chirimoyo.org"),
  title: {
    default: "Comunidad Chirimoyo",
    template: "%s | Comunidad Chirimoyo",
  },
  description:
    "Vecinos y ecologistas en defensa del humedal de Chirimoyo, Orizaba, Veracruz.",
  openGraph: {
    siteName: "Comunidad Chirimoyo",
    description:
      "Vecinos y ecologistas en defensa del humedal de Chirimoyo, Orizaba, Veracruz.",
    locale: "es_MX",
    type: "website",
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
      </body>
    </html>
  );
}
