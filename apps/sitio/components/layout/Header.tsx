/* Header.tsx — barra superior de los sitios de la Comunidad (propio de sitio,
   distinto del de la guía de aves). Server Component. */
import Link from "next/link";

const NAV = [
  { href: "/comunidad", label: "Comunidad" },
  { href: "/voluntarios", label: "Voluntarios" },
  { href: "https://aves.chirimoyo.org", label: "Aves", external: true },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-forest/10 bg-paper-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-chirimoyo.jpeg"
            alt="Comunidad Chirimoyo"
            className="h-11 w-11 rounded-full object-cover ring-1 ring-forest/15"
          />
          <span className="font-serif text-[20px] font-semibold leading-none text-forest-deep">
            Comunidad Chirimoyo
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-[14px] font-semibold text-forest">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-forest-deep">
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
