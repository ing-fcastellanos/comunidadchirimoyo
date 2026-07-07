/* Hero.tsx — sección principal del landing de chirimoyo.org. Reusa el layout a
   dos columnas y el carrusel automático por CSS del hero del catálogo, pero con
   fotos documentales del humedal/comunidad (de galeria.json, marcadas hero:true),
   no fauna. Server Component. Si no hay fotos, cae a una sola columna de texto.
   El título/resumen vienen de lucha.md; los slides se resuelven en el data-layer. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { VOLUNTARIOS_URL } from "@/lib/links";
import type { HeroSlide } from "@/lib/landing";

/* El carrusel rota por CSS (crossfade, sin JS). El delay negativo escalonado pone
   cada slide en fase para que el bucle empalme sin salto. Ciclo de 16 s. */
const CYCLE_S = 16;
function delayFor(i: number, total: number): string {
  return `${i === 0 ? 0 : (i - total) * (CYCLE_S / total)}s`;
}

export interface HeroProps {
  titulo: string;
  resumen: string;
  slides: HeroSlide[];
}

export function Hero({ titulo, resumen, slides }: HeroProps) {
  const conFoto = slides.length > 0;
  const animated = slides.length > 1;
  return (
    <section className="relative overflow-hidden border-b border-forest/10">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-20 lg:gap-14 lg:py-24 ${
          conFoto ? "lg:grid-cols-[1.05fr_0.95fr]" : ""
        }`}
      >
        {/* ---- Columna de texto ---- */}
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-forest-deep">
            <Icon name="MapPin" className="h-4 w-4" />
            Humedal del Chirimoyo · Orizaba, Veracruz
          </div>

          <h1 className="font-serif text-[clamp(40px,7vw,64px)] font-semibold leading-[1.05] text-forest-deep text-balance">
            {titulo}
          </h1>

          <p className="mt-5 max-w-[36rem] text-[18px] leading-relaxed text-ink/80 text-pretty">
            {resumen}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={VOLUNTARIOS_URL}
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-forest px-6 py-3.5 text-[16px] font-semibold text-paper-card shadow-card transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              Súmate a las jornadas
              <Icon
                name="ArrowRight"
                className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <Link
              href="#el-caso"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest/25 bg-paper-card/60 px-6 py-3.5 text-[16px] font-semibold text-forest-deep transition-colors hover:border-forest/40 hover:bg-paper-card focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              Conoce el caso
            </Link>
          </div>
        </div>

        {/* ---- Columna de imagen (carrusel automático por CSS) ---- */}
        {conFoto && (
          <figure className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-deep shadow-card ring-1 ring-forest/10 sm:aspect-[4/5] lg:aspect-[4/5]">
              {slides.map((s, i) => (
                /* eslint-disable-next-line @next/next/no-img-element -- foto servida desde public/ (interino) o bucket (ADR-0021) */
                <img
                  key={s.slug}
                  src={s.src}
                  alt={s.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className={`absolute inset-0 h-full w-full object-cover ${animated ? "hero-slide" : ""}`}
                  style={
                    animated ? { animationDelay: delayFor(i, slides.length) } : undefined
                  }
                />
              ))}
            </div>
            {/* Pies apilados: rotan sincronizados con la imagen (mismo ciclo y delay) */}
            <figcaption className="absolute bottom-4 left-4 right-4 grid">
              {slides.map((s, i) => (
                <span
                  key={s.slug}
                  className={`col-start-1 row-start-1 flex items-center gap-2 rounded-xl bg-pine-deep/70 px-4 py-2.5 font-mono text-[12px] tracking-wide text-paper/90 backdrop-blur ${animated ? "hero-cap" : ""}`}
                  style={
                    animated ? { animationDelay: delayFor(i, slides.length) } : undefined
                  }
                >
                  <Icon name="Camera" className="h-4 w-4 shrink-0" />
                  {s.pie}
                </span>
              ))}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
