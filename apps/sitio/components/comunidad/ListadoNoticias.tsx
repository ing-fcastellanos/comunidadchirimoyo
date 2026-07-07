/* ListadoNoticias.tsx — listado paginado de notas de comunidad (#71). Server
   Component. Recibe el slice de la página y la info de paginación; si no hay
   notas en total, muestra un estado vacío amable (no un error). */
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { NoticiaCard } from "./NoticiaCard";
import { PaginacionNoticias } from "./PaginacionNoticias";
import type { NoticiaMeta } from "@/lib/noticias";

export function ListadoNoticias({
  notas,
  pagina,
  totalPaginas,
  hayNotas,
}: {
  notas: NoticiaMeta[];
  pagina: number;
  totalPaginas: number;
  /** Si hay notas publicadas en total (para distinguir "vacío" de "página vacía"). */
  hayNotas: boolean;
}) {
  return (
    <Section className="py-16 sm:py-24">
      <SectionTitle as="h1" kicker="Comunidad" icon="Newspaper">
        Noticias
      </SectionTitle>

      {hayNotas ? (
        <>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {notas.map((nota) => (
              <NoticiaCard key={nota.slug} nota={nota} titleAs="h2" />
            ))}
          </div>
          <PaginacionNoticias pagina={pagina} totalPaginas={totalPaginas} />
        </>
      ) : (
        <div className="rounded-2xl bg-paper-card p-10 text-center shadow-card ring-1 ring-forest/[0.07]">
          <p className="font-serif text-[22px] font-semibold text-forest-deep">
            Aún no publicamos noticias
          </p>
          <p className="mx-auto mt-2 max-w-md text-[16px] leading-relaxed text-ink/75">
            Estamos preparando las primeras notas sobre la comunidad y las jornadas en el
            humedal. Vuelve pronto.
          </p>
        </div>
      )}
    </Section>
  );
}
