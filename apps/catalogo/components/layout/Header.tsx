/* Header.tsx — barra superior del catálogo. Portado del handoff v0.dev.
   Server Component. */
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-forest/10 bg-paper-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-chirimoyo.jpeg"
            alt="Logotipo de la Comunidad del Chirimoyo"
            className="h-12 w-12 rounded-full object-cover ring-1 ring-forest/15"
          />
          <span className="leading-tight">
            <span className="block font-serif text-[20px] font-semibold text-forest-deep">
              Comunidad del Chirimoyo
            </span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-forest/70">
              Guía de Aves · Orizaba, Veracruz
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
