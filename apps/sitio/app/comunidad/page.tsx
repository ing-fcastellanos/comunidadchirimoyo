import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon } from "@/components/ui/Icon";
import { ElCaso } from "@/components/landing/ElCaso";
import { QueHacemos } from "@/components/comunidad/QueHacemos";
import { LineaTiempo } from "@/components/comunidad/LineaTiempo";
import { NoticiaCard } from "@/components/comunidad/NoticiaCard";
import { getAllNoticias } from "@/lib/noticias";
import { getLucha, getActividades, getLogros, mediaUrl } from "@/lib/landing";

export const metadata = {
  title: "Comunidad",
  alternates: { canonical: "/comunidad" },
};

export default async function Comunidad() {
  const [lucha, actividades, logros, noticias] = await Promise.all([
    getLucha(),
    getActividades(),
    getLogros(),
    getAllNoticias(),
  ]);
  const ultimas = noticias.slice(0, 3);

  return (
    <>
      <Section className="pt-16 sm:pt-24">
        <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
          Comunidad del Chirimoyo · Orizaba, Veracruz
        </div>
        <h1 className="mt-3 font-serif text-[clamp(40px,7vw,72px)] font-semibold leading-[0.95] text-forest-deep">
          La comunidad
        </h1>
        <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-ink/80">
          Vecinas y vecinos que defendemos el humedal del Chirimoyo: su historia, lo
          que hacemos para cuidarlo, lo que hemos logrado juntos y las últimas noticias.
        </p>
      </Section>

      <ElCaso
        secciones={lucha.secciones}
        fotoUrl={mediaUrl(lucha.casoFoto)}
        fotoAlt={lucha.casoFotoAlt}
      />

      <QueHacemos data={actividades} />

      <LineaTiempo data={logros} />

      {ultimas.length > 0 && (
        <Section className="py-16 sm:py-20">
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
        </Section>
      )}
    </>
  );
}
