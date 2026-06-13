/* QueHayAqui.tsx — tres tarjetas escaneables: qué contiene el catálogo.
   Portado del handoff v0.dev. El conteo de aves llega por prop (no hardcodeado). */
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

type Card = { icon: IconName; title: string; body: string };

export function QueHayAqui({ avesCount }: { avesCount: number }) {
  const cards: Card[] = [
    {
      icon: "Feather",
      title: `${avesCount} especies de aves`,
      body: "Fichas de las aves residentes y migratorias documentadas en la laguna.",
    },
    {
      icon: "Leaf",
      title: "Anfibios y reptiles",
      body: "Ranas, sapos, lagartijas y otras especies que comparten el humedal.",
    },
    {
      icon: "BookOpenCheck",
      title: "Fichas con fuentes verificadas",
      body: "Información contrastada con EncicloVida, eBird y guías de campo.",
    },
  ];

  return (
    <Section className="py-14 sm:py-20">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.title}
            className="flex flex-col gap-4 rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
              <Icon name={c.icon} className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-serif text-[24px] font-semibold leading-tight text-forest-deep text-balance">
                {c.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/75 text-pretty">
                {c.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
