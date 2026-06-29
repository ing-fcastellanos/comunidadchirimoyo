import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon } from "@/components/ui/Icon";
import { InscripcionForm } from "@/components/voluntarios/InscripcionForm";
import { getEnlaces } from "@/lib/landing";

export const metadata = {
  title: "Voluntarios",
  alternates: { canonical: "/voluntarios" },
};

export default async function Voluntarios() {
  const { jornadas } = await getEnlaces();

  return (
    <>
      <Section className="pt-16 sm:pt-24">
        <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
          Voluntarios · Humedal del Chirimoyo
        </div>
        <h1 className="mt-3 font-serif text-[clamp(40px,7vw,72px)] font-semibold leading-[0.95] text-forest-deep">
          Súmate a las jornadas
        </h1>
        <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-ink/80">
          Las jornadas de limpieza y mantenimiento del humedal son abiertas: no
          necesitas experiencia, solo ganas de cuidar el Chirimoyo. Consulta el
          calendario e inscríbete para que te avisemos de la próxima.
        </p>

        {jornadas?.calendarioUrl && (
          <a
            href={jornadas.calendarioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-mint-wash px-5 py-3 text-[15px] font-semibold text-forest-deep ring-1 ring-forest/15 transition-colors hover:bg-mint-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
          >
            <Icon name="CalendarDays" className="h-[18px] w-[18px]" />
            Ver el calendario de jornadas
          </a>
        )}
      </Section>

      <Section className="py-14 sm:py-20">
        <SectionTitle kicker="Inscripción" icon="HeartHandshake">
          Inscríbete como voluntaria o voluntario
        </SectionTitle>
        <p className="mb-7 max-w-2xl text-[16px] leading-relaxed text-ink/75">
          Déjanos tus datos y te contactamos para coordinar tu participación.
          Solo usamos esta información para organizar las jornadas.
        </p>
        <div className="max-w-[640px]">
          <InscripcionForm />
        </div>
      </Section>
    </>
  );
}
