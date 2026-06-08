import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";

export const metadata = { title: "Voluntarios" };

export default function Voluntarios() {
  return (
    <Section className="py-16 sm:py-24">
      <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
        Andamiaje · voluntarios.chirimoyo.org
      </div>
      <h1 className="mt-3 font-serif text-[clamp(40px,7vw,72px)] font-semibold leading-[0.95] text-forest-deep">
        Súmate a las jornadas
      </h1>
      <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-ink/80">
        Jornadas de limpieza y mantenimiento, calendario, inscripción y formas
        de apoyar (Spin/OXXO, en especie). Placeholder del scaffold.
      </p>
      <div className="mt-12">
        <SectionTitle kicker="Próximamente" icon="HeartHandshake">
          Jornadas · Inscripción · Donaciones
        </SectionTitle>
        <div className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
          <p className="text-[16px] leading-relaxed text-ink/75">
            La inscripción (cliente → API) y las donaciones informativas se
            construyen en Fase 4.
          </p>
        </div>
      </div>
    </Section>
  );
}
