/* /comunidad/noticias/[slug] — detalle de una nota de comunidad (#72). Server
   Component estático (espejo del patrón del catálogo [grupo]/[slug]): rutas
   pre-generadas con generateStaticParams; notFound() si el slug no existe. El
   cuerpo se renderiza con Markdown (#69); la imagen OG la genera opengraph-image. */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { Markdown } from "@/components/ui/Markdown";
import { getAllNoticias, getNoticia } from "@/lib/noticias";
import { formatearFecha, vecinos } from "@/lib/noticias-paginacion";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const notas = await getAllNoticias();
  return notas.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const nota = await getNoticia(slug);
  if (!nota) return {};
  return {
    title: nota.titulo,
    description: nota.resumen,
    alternates: { canonical: `/comunidad/noticias/${nota.slug}` },
    openGraph: {
      title: nota.titulo,
      description: nota.resumen,
      type: "article",
      publishedTime: nota.fecha || undefined,
      authors: nota.autor ? [nota.autor] : undefined,
    },
    twitter: { card: "summary_large_image", title: nota.titulo, description: nota.resumen },
  };
}

function VecinoLink({
  nota,
  direccion,
}: {
  nota: { slug: string; titulo: string };
  direccion: "anterior" | "siguiente";
}) {
  const esAnterior = direccion === "anterior";
  return (
    <Link
      href={`/comunidad/noticias/${nota.slug}`}
      rel={esAnterior ? "prev" : "next"}
      className={`group flex max-w-[48%] flex-col gap-1 ${esAnterior ? "items-start text-left" : "ml-auto items-end text-right"}`}
    >
      <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-forest">
        {esAnterior && <Icon name="ArrowLeft" className="h-[14px] w-[14px]" />}
        {esAnterior ? "Anterior" : "Siguiente"}
        {!esAnterior && <Icon name="ArrowRight" className="h-[14px] w-[14px]" />}
      </span>
      <span className="line-clamp-2 text-[15px] font-semibold text-forest-deep transition-colors group-hover:text-forest">
        {nota.titulo}
      </span>
    </Link>
  );
}

export default async function NotaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nota = await getNoticia(slug);
  if (!nota) notFound();

  const notas = await getAllNoticias();
  const { anterior, siguiente } = vecinos(notas, slug);

  return (
    <article className="pb-16">
      <Section className="pt-10 sm:pt-14">
        <Link
          href="/comunidad/noticias"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-forest-deep transition-colors hover:text-forest"
        >
          <Icon name="ArrowLeft" className="h-[16px] w-[16px]" />
          Volver a noticias
        </Link>

        <header className="mt-6 max-w-3xl">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-forest">Noticias</p>
          <h1 className="mt-2 font-serif text-[clamp(30px,5vw,48px)] font-semibold leading-[1.05] text-forest-deep text-balance">
            {nota.titulo}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink/70">
            {nota.fecha && <time dateTime={nota.fecha}>{formatearFecha(nota.fecha)}</time>}
            {nota.autor && (
              <>
                <span aria-hidden className="text-ink/30">·</span>
                <span>{nota.autor}</span>
              </>
            )}
          </p>
        </header>

        {nota.portada && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-mint-wash ring-1 ring-forest/10">
            <Image
              src={nota.portada}
              alt={nota.portadaAlt ?? ""}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-10 max-w-3xl">
          <Markdown>{nota.cuerpo}</Markdown>
        </div>

        {(anterior || siguiente) && (
          <nav
            aria-label="Más noticias"
            className="mt-14 flex items-start gap-6 border-t border-forest/10 pt-8"
          >
            {anterior && <VecinoLink nota={anterior} direccion="anterior" />}
            {siguiente && <VecinoLink nota={siguiente} direccion="siguiente" />}
          </nav>
        )}
      </Section>
    </article>
  );
}
