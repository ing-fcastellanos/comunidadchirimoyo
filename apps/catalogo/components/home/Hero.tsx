/* Hero.tsx — sección principal del inicio: comprensión en 10 segundos.
   Portado del handoff v0.dev (components/home/Hero.jsx). Server Component. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { fotoUrl } from "@/lib/fauna-schema";
import { COMUNIDAD_URL } from "@/lib/links";

/* Imagen del avetoro servida desde el bucket (ADR-0016), no desde public/. */
const HERO_IMG = fotoUrl("botaurus-lentiginosus", "DSCN1632.webp", "web");

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-forest/10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
        {/* ---- Columna de texto ---- */}
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
            <Icon name="MapPin" className="h-4 w-4" />
            Humedal del Chirimoyo · Orizaba, Veracruz
          </div>

          <h1 className="font-serif text-[clamp(40px,7vw,64px)] font-semibold leading-[1.05] text-forest-deep text-balance">
            Las aves del humedal del Chirimoyo
          </h1>

          <p className="mt-5 max-w-[36rem] text-[18px] leading-relaxed text-ink/80 text-pretty">
            Un catálogo vivo de la fauna que habita la laguna que defendemos:
            búscala por forma, color o dónde la viste.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/busqueda"
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-forest px-6 py-3.5 text-[16px] font-semibold text-paper-card shadow-card transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              Explorar el catálogo
              <Icon
                name="ArrowRight"
                className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href={COMUNIDAD_URL}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest/25 bg-paper-card/60 px-6 py-3.5 text-[16px] font-semibold text-forest-deep transition-colors hover:border-forest/40 hover:bg-paper-card focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              Conocer la comunidad
            </a>
          </div>
        </div>

        {/* ---- Columna de imagen ---- */}
        <figure className="relative">
          <div className="overflow-hidden rounded-2xl bg-paper-deep shadow-card ring-1 ring-forest/10">
            {/* eslint-disable-next-line @next/next/no-img-element -- export estático, imágenes servidas desde el bucket (ADR-0016) */}
            <img
              src={HERO_IMG}
              alt="Avetoro Norteño mimetizado entre los pastos y cañas del humedal del Chirimoyo."
              className="aspect-[4/5] w-full object-cover sm:aspect-square lg:aspect-[4/5]"
            />
          </div>
          <figcaption className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-pine-deep/70 px-4 py-2.5 font-mono text-[12px] tracking-wide text-paper/90 backdrop-blur">
            <Icon name="Camera" className="h-4 w-4" />
            Avetoro Norteño · Laguna del Chirimoyo
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
