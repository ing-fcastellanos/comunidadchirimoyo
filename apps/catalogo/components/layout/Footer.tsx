/* Footer.tsx — créditos y fuentes. Portado del handoff v0.dev. Server Component. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const SOURCES = [
  "EncicloVida / CONABIO",
  "Wikipedia (es / en)",
  "eBird · Cornell Lab",
  "Aves Migratorias",
  "Animalia.bio",
  "Audubon Field Guide",
  "NOM-059-SEMARNAT-2010 · PROFEPA",
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-forest/15 bg-paper-deep">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-chirimoyo.png"
                alt="Logotipo de la Comunidad del Chirimoyo"
                className="h-14 w-14 shrink-0 object-contain"
              />
              <div className="font-serif text-[24px] font-semibold leading-tight text-forest-deep">
                Comunidad del Chirimoyo
                <span className="block font-sans text-[12px] font-bold uppercase tracking-[0.18em] text-forest/70">
                  Guía de Aves
                </span>
              </div>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
              Laguna del Chirimoyo, Orizaba, Veracruz, México.
            </p>
          </div>
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-forest-deep">
              Fuentes
            </div>
            <ul className="mt-3 space-y-1.5 text-[15px] text-ink/75">
              {SOURCES.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Icon name="Dot" className="h-4 w-4 text-mint-deep" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-forest-deep">
              El proyecto
            </div>
            <ul className="mt-3 space-y-1.5 text-[15px] text-ink/75">
              <li>
                <Link
                  href="/colaboradores"
                  className="inline-flex items-center gap-2 transition-colors hover:text-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 rounded-md"
                >
                  <Icon name="Users" className="h-4 w-4 text-mint-deep" />
                  Colaboradores
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-forest/10 pt-6 text-[13px] text-ink-soft/70">
          Elaborada con fines educativos y de divulgación · Comunidad del Chirimoyo
        </div>
      </div>
    </footer>
  );
}
