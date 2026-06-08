import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge } from "@/components/ui/Badge";

export default function Home() {
  return (
    <Section className="py-16 sm:py-24">
      <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
        Andamiaje · Guía de Aves
      </div>
      <h1 className="mt-3 font-serif text-[clamp(40px,7vw,72px)] font-semibold leading-[0.95] text-forest-deep">
        aves.chirimoyo.org
      </h1>
      <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-ink/80">
        Catálogo de aves y anfibios del humedal de Chirimoyo. Esta es la página
        placeholder del scaffold — confirma que el sistema de diseño está activo.
      </p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <Badge tone="forest">Migratoria de invierno</Badge>
        <Badge tone="ochre">Rara</Badge>
        <Badge tone="terra">Protección Especial · NOM-059</Badge>
        <Badge tone="teal">Nativa</Badge>
      </div>

      <div className="mt-12">
        <SectionTitle kicker="Próximamente" icon="Bird">
          Catálogo
        </SectionTitle>
        <div className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
          <p className="text-[16px] leading-relaxed text-ink/75">
            El listado, el buscador y el detalle por especie se construyen en los
            issues #11, #12 y #13. El PDF del catálogo en #14.
          </p>
        </div>
      </div>
    </Section>
  );
}
