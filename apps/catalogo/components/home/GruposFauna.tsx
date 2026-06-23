/* GruposFauna.tsx — tres tarjetas de grupo del hub de fauna. Aves está activa
   (enlaza a /aves, con conteo derivado en build); anfibios y reptiles se muestran
   como «próximamente», visualmente distintas y sin enlace a contenido inexistente.
   Server Component. */
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

type GrupoCard = {
  icon: IconName;
  titulo: string;
  cuerpo: string;
  activo: boolean;
  href?: string;
  meta?: string;
};

export function GruposFauna({ avesCount }: { avesCount: number }) {
  const cards: GrupoCard[] = [
    {
      icon: "Bird",
      titulo: "Aves",
      cuerpo: "Aves residentes y migratorias documentadas en la laguna, con fichas y buscador por forma, color y hábitat.",
      activo: true,
      href: "/aves",
      meta: `${avesCount} especies`,
    },
    {
      icon: "Leaf",
      titulo: "Anfibios",
      cuerpo: "Ranas, sapos y salamandras del humedal. Estamos preparando sus fichas.",
      activo: false,
    },
    {
      icon: "Footprints",
      titulo: "Reptiles",
      cuerpo: "Lagartos y serpientes que comparten la laguna. Estamos preparando sus fichas.",
      activo: false,
    },
  ];

  return (
    <Section className="py-14 sm:py-20">
      <div className="mb-8 max-w-2xl">
        <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">El catálogo</p>
        <h2 className="mt-2 font-serif text-[clamp(28px,4vw,40px)] font-semibold leading-[1.08] text-forest-deep text-balance">
          Explora la fauna por grupo
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
                  <Icon name={c.icon} className="h-6 w-6" />
                </span>
                {c.activo ? (
                  c.meta && (
                    <span className="rounded-full bg-forest/10 px-3 py-1 text-[12px] font-bold text-forest-deep">
                      {c.meta}
                    </span>
                  )
                ) : (
                  <span className="rounded-full bg-ochre/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ochre">
                    Próximamente
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h3 className="font-serif text-[24px] font-semibold leading-tight text-forest-deep text-balance">
                  {c.titulo}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/75 text-pretty">{c.cuerpo}</p>
              </div>
              {c.activo && (
                <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-forest-deep">
                  Ver las aves
                  <Icon name="ArrowRight" className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </>
          );

          return c.activo && c.href ? (
            <Link
              key={c.titulo}
              href={c.href}
              className="group flex flex-col rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07] transition-all hover:-translate-y-0.5 hover:ring-forest/25 hover:shadow-card focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={c.titulo}
              aria-disabled="true"
              className="flex flex-col rounded-2xl bg-paper-card/60 p-7 shadow-soft ring-1 ring-forest/[0.07]"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
