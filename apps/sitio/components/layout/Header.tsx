/* Header.tsx — barra superior del ecosistema "Comunidad Chirimoyo" (propio de
   sitio, distinto del de la guía de aves). Server Component; el menú móvil (drawer)
   vive en el subcomponente cliente MobileNav. Portado del handoff v0.dev. */
import Link from "next/link";
import { MobileNav, type NavLink } from "./MobileNav";
import { COMUNIDAD_URL, VOLUNTARIOS_URL, AVES_URL } from "@/lib/links";

/* Nav del ecosistema: Comunidad y Voluntarios son rutas relativas del mismo
   dominio (ADR-0023); Aves es URL absoluta (app/deploy propio). Coherente con el
   linktree y los CTAs del landing. */
const NAV: NavLink[] = [
  { titulo: "Comunidad", url: COMUNIDAD_URL },
  { titulo: "Noticias", url: "/comunidad/noticias" },
  { titulo: "Voluntarios", url: VOLUNTARIOS_URL },
  { titulo: "Aves", url: AVES_URL },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-forest/10 bg-paper-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
        {/* logo + nombre → inicio del sitio actual */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- logo pequeño servido desde public/ */}
          <img
            src="/logo-chirimoyo.png"
            alt="Comunidad Chirimoyo"
            className="h-11 w-11 shrink-0 object-contain"
          />
          <span className="whitespace-nowrap font-serif text-[19px] font-semibold leading-none text-forest-deep sm:text-[21px]">
            <span className="hidden min-[400px]:inline">Comunidad </span>Chirimoyo
          </span>
        </Link>

        {/* escritorio: enlaces de texto */}
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Sitios del ecosistema">
          {NAV.map((n) => (
            <a
              key={n.url}
              href={n.url}
              className="rounded-full px-4 py-2 text-[15px] font-semibold text-forest-deep ring-1 ring-transparent transition-colors hover:bg-mint-wash hover:ring-forest/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              {n.titulo}
            </a>
          ))}
        </nav>

        {/* móvil: hamburguesa + drawer (cliente) */}
        <MobileNav links={NAV} />
      </div>
    </header>
  );
}
