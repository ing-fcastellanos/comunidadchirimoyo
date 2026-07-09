import type { Metadata } from "next";
import { serif, sans } from "@/lib/fonts";
import "./globals.css";

/* Layout raíz — scaffold (#138). Branding mínimo; sin Header/Footer de sitio
   (esos son de la marca pública). El shell real del panel (nav, logout, etc.)
   llega con el login en #139/#140, dentro de app/(authed)/layout.tsx. */

export const metadata: Metadata = {
  title: {
    default: "Comunidad Chirimoyo · Admin",
    template: "%s · Comunidad Chirimoyo Admin",
  },
  description: "Panel de administración de Comunidad Chirimoyo.",
  robots: { index: false, follow: false },
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
        <header className="border-b border-forest/10 bg-paper-card px-6 py-4">
          <span className="font-serif text-[20px] font-semibold text-forest-deep">
            Comunidad Chirimoyo <span className="text-ink/50">· Admin</span>
          </span>
        </header>
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
