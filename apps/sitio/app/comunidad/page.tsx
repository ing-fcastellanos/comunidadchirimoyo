import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const metadata = {
  title: "Comunidad",
  alternates: { canonical: "/comunidad" },
};

export default function Comunidad() {
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
      <div className="mt-12">
        <SectionTitle kicker="Próximamente" icon="Newspaper">
          Historia · Misión · Noticias
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
