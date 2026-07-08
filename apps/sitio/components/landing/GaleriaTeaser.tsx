/* GaleriaTeaser.tsx — franja del landing con unas pocas fotos que enlaza a la
   galería completa (/galeria). Server Component (sin lightbox: eso vive en
   /galeria). Las fotos llegan resueltas desde el data-layer. */
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Icon } from "@/components/ui/Icon";
import type { FotoResuelta } from "@/lib/landing";

const MAX_TEASER = 4;

export function GaleriaTeaser({
  titulo,
  resumen,
  fotos,
}: {
  titulo: string;
  resumen: string;
  fotos: FotoResuelta[];
}) {
  const muestra = fotos.slice(0, MAX_TEASER);
  if (muestra.length === 0) return null;

  return (
    <Section className="py-14 sm:py-20">
      <SectionTitle icon="Image" kicker="Imágenes del humedal">
        {titulo}
      </SectionTitle>
      <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-ink/75 text-pretty">
        {resumen}
      </p>

      <Link
        href="/galeria"
        aria-label="Ver la galería completa"
        className="group block overflow-hidden rounded-2xl ring-1 ring-forest/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
      >
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {muestra.map((foto) => (
            <div key={foto.slug} className="relative aspect-square overflow-hidden bg-paper-deep">
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition duration-300 group-hover:scale-[1.04]"
              />
            </div>
          ))}
        </div>
      </Link>

      <Link
        href="/galeria"
        className="group mt-6 inline-flex items-center gap-2 text-[16px] font-semibold text-forest transition-colors hover:text-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 rounded-md"
      >
        Ver la galería completa
        <Icon
          name="ArrowRight"
          className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </Section>
  );
}
