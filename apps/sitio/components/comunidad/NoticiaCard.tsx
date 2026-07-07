/* NoticiaCard.tsx — tarjeta de nota en el listado de comunidad (#71). Server
   Component: portada con next/image (fallback si falta), fecha, título y
   resumen; toda la tarjeta enlaza al detalle /comunidad/noticias/<slug> (el
   detalle llega en #72). */
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { NoticiaMeta } from "@/lib/noticias";
import { formatearFecha } from "@/lib/noticias-paginacion";

export function NoticiaCard({
  nota,
  titleAs: Titulo = "h3",
}: {
  nota: NoticiaMeta;
  /** Nivel del título de la card según su contexto de anidación. Default `h3`
      (bajo una sección `h2`). En el listado de noticias, donde el título de la
      página es `h1`, se usa `h2` para no saltar niveles. */
  titleAs?: "h2" | "h3";
}) {
  return (
    <Link
      href={`/comunidad/noticias/${nota.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.07] transition-all hover:-translate-y-0.5 hover:ring-forest/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-mint-wash">
        {nota.portada ? (
          <Image
            src={nota.portada}
            alt={nota.portadaAlt ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-forest/30">
            <Icon name="Newspaper" className="h-12 w-12" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <time dateTime={nota.fecha} className="text-[12px] font-bold uppercase tracking-[0.16em] text-forest">
          {formatearFecha(nota.fecha)}
        </time>
        <Titulo className="mt-2 font-serif text-[22px] font-semibold leading-tight text-forest-deep text-balance">
          {nota.titulo}
        </Titulo>
        <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-relaxed text-ink/75 text-pretty">
          {nota.resumen}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-forest-deep">
          Leer la nota
          <Icon name="ArrowRight" className="h-[16px] w-[16px] transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
