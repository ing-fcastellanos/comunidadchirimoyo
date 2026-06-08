import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";

export default function Landing() {
  return (
    <Section className="py-16 sm:py-24">
      <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
        Andamiaje · chirimoyo.org
      </div>
      <h1 className="mt-3 font-serif text-[clamp(44px,8vw,80px)] font-semibold leading-[0.95] text-forest-deep">
        Defendemos el humedal del Chirimoyo
      </h1>
      <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-ink/80">
        Landing de la Comunidad — introducción a la lucha, linktree y contacto.
        Página placeholder del scaffold; confirma el sistema de diseño y el
        ruteo por subdominio.
      </p>
      <div className="mt-7 flex flex-wrap gap-2.5">
        <Badge tone="forest">Comunidad</Badge>
        <Badge tone="teal">Voluntarios</Badge>
        <Badge tone="ochre">Aves</Badge>
      </div>
      <p className="mt-10 text-[15px] text-ink-soft/80">
        Contenido real (linktree, contacto) → Fase 3.
      </p>
    </Section>
  );
}
