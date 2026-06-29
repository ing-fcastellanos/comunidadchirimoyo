/* PaginacionNoticias.tsx — navegación Anterior/Siguiente del listado (#71).
   Server Component. La página 1 vive en /comunidad/noticias; las demás en
   /comunidad/noticias/pagina/<n>. Cada control se omite en su extremo. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const BASE = "/comunidad/noticias";

/** Ruta de una página: la 1 es la base; el resto bajo /pagina/<n>. */
function rutaPagina(n: number): string {
  return n <= 1 ? BASE : `${BASE}/pagina/${n}`;
}

export function PaginacionNoticias({ pagina, totalPaginas }: { pagina: number; totalPaginas: number }) {
  if (totalPaginas <= 1) return null;

  const hayAnterior = pagina > 1;
  const haySiguiente = pagina < totalPaginas;

  return (
    <nav aria-label="Paginación de noticias" className="mt-12 flex items-center justify-between gap-4">
      {hayAnterior ? (
        <Link
          href={rutaPagina(pagina - 1)}
          rel="prev"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold text-forest-deep ring-1 ring-forest/20 transition-colors hover:bg-mint-wash focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
        >
          <Icon name="ArrowLeft" className="h-[18px] w-[18px]" />
          Anterior
        </Link>
      ) : (
        <span />
      )}

      <span className="text-[14px] font-medium text-ink/70">
        Página {pagina} de {totalPaginas}
      </span>

      {haySiguiente ? (
        <Link
          href={rutaPagina(pagina + 1)}
          rel="next"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold text-forest-deep ring-1 ring-forest/20 transition-colors hover:bg-mint-wash focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
        >
          Siguiente
          <Icon name="ArrowRight" className="h-[18px] w-[18px]" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
