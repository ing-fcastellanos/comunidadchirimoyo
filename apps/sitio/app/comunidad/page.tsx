import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon } from "@/components/ui/Icon";
import { NoticiaCard } from "@/components/comunidad/NoticiaCard";
import { getAllNoticias } from "@/lib/noticias";

export const metadata = {
  title: "Comunidad",
  alternates: { canonical: "/comunidad" },
};

export default async function Comunidad() {
  const ultimas = (await getAllNoticias()).slice(0, 3);

  return (
    <Section className="py-16 sm:py-24">
      <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
        Andamiaje · comunidad.chirimoyo.org
      </div>
      <h1 className="mt-3 font-serif text-[clamp(40px,7vw,72px)] font-semibold leading-[0.95] text-forest-deep">
        La comunidad
      </h1>
      <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-ink/80">
        Historia del lugar, acciones tomadas, misión y visión, y noticias.
        Placeholder del scaffold.
      </p>

      {ultimas.length > 0 && (
        <div className="mt-14">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <SectionTitle kicker="Comunidad" icon="Newspaper">
              Últimas noticias
            </SectionTitle>
            <Link
              href="/comunidad/noticias"
              className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-forest-deep transition-colors hover:text-forest focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 rounded-md"
            >
              Ver todas las noticias
              <Icon name="ArrowRight" className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {ultimas.map((nota) => (
              <NoticiaCard key={nota.slug} nota={nota} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-14">
        <SectionTitle kicker="Próximamente" icon="Landmark">
          Historia · Misión
        </SectionTitle>
        <div className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
          <p className="text-[16px] leading-relaxed text-ink/75">
            El contenido de comunidad se construye en Fase 3.
          </p>
        </div>
      </div>
    </Section>
  );
}
