/* Header.tsx — barra superior del catálogo. Portado del handoff v0.dev.
   Server Component. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

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

        {/* Escritorio: enlace de texto que se vuelve píldora forest suave al hover */}
        <Link
          href="/busqueda"
          className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-semibold text-forest-deep ring-1 ring-transparent transition-colors hover:bg-mint-wash hover:ring-forest/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 sm:inline-flex"
        >
          <Icon name="Search" className="h-[18px] w-[18px]" />
          Buscar especies
        </Link>

        {/* Móvil: botón de icono compacto */}
        <Link
          href="/busqueda"
          aria-label="Buscar especies"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-wash text-forest-deep ring-1 ring-forest/15 transition-colors hover:bg-mint-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 sm:hidden"
        >
          <Icon name="Search" className="h-[18px] w-[18px]" />
        </Link>
      </div>
    </header>
  );
}
