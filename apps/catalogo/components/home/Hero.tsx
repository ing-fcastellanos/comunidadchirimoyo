/* Hero.tsx — sección principal con carrusel automático por CSS (crossfade, sin
   JS). Portado del handoff v0.dev (components/home/Hero.jsx). Server Component.
   El texto y los CTAs llegan por `content` para que lo reusen tanto el landing
   de aves (/aves) como el hub de fauna (/). */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export interface HeroSlide {
  src: string;
  alt: string;
  nombre: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  lead: string;
  /** CTA primario, navegación interna. */
  primary: { href: string; label: string };
  /** CTA secundario opcional, normalmente externo (comunidad). */
  secondary?: { href: string; label: string };
}

/* Las imágenes del hero son las portadas curadas (fotos[0]) de las especies
   destacadas (derivadas en la página, servidas desde el bucket — ADR-0016) y
   rotan en un carrusel automático por CSS (crossfade, sin JS). El delay negativo
   escalonado pone cada slide en fase para que el bucle empalme sin salto. */
const CYCLE_S = 16; // 4 fotos × 4 s
function delayFor(i: number, total: number): string {
  // i=0 → 0s; i>0 → negativo para que el slide i quede activo en [i·4s, (i+1)·4s]
  return `${i === 0 ? 0 : (i - total) * (CYCLE_S / total)}s`;
}

export function Hero({ slides, content }: { slides: HeroSlide[]; content: HeroContent }) {
  const animated = slides.length > 1;
  return (
    <section className="relative overflow-hidden border-b border-forest/10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
        {/* ---- Columna de texto ---- */}
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
            <Icon name="MapPin" className="h-4 w-4" />
            {content.eyebrow}
          </div>

          <h1 className="font-serif text-[clamp(40px,7vw,64px)] font-semibold leading-[1.05] text-forest-deep text-balance">
            {content.title}
          </h1>

          <p className="mt-5 max-w-[36rem] text-[18px] leading-relaxed text-ink/80 text-pretty">
            {content.lead}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={content.primary.href}
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-forest px-6 py-3.5 text-[16px] font-semibold text-paper-card shadow-card transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
            >
              {content.primary.label}
              <Icon
                name="ArrowRight"
                className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            {content.secondary && (
              <a
                href={content.secondary.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest/25 bg-paper-card/60 px-6 py-3.5 text-[16px] font-semibold text-forest-deep transition-colors hover:border-forest/40 hover:bg-paper-card focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
              >
                {content.secondary.label}
              </a>
            )}
          </div>
        </div>

        {/* ---- Columna de imagen (carrusel automático por CSS) ---- */}
        <figure className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-deep shadow-card ring-1 ring-forest/10 sm:aspect-square lg:aspect-[4/5]">
            {slides.map((s, i) => (
              /* eslint-disable-next-line @next/next/no-img-element -- export estático, imágenes servidas desde el bucket (ADR-0016) */
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className={`absolute inset-0 h-full w-full object-cover ${animated ? "hero-slide" : ""}`}
                style={animated ? { animationDelay: delayFor(i, slides.length) } : undefined}
              />
            ))}
          </div>
          {/* Pies apilados: rotan sincronizados con la imagen (mismo ciclo y delay) */}
          <figcaption className="absolute bottom-4 left-4 right-4 grid">
            {slides.map((s, i) => (
              <span
                key={s.nombre}
                className={`col-start-1 row-start-1 flex items-center gap-2 rounded-xl bg-pine-deep/70 px-4 py-2.5 font-mono text-[12px] tracking-wide text-paper/90 backdrop-blur ${animated ? "hero-cap" : ""}`}
                style={animated ? { animationDelay: delayFor(i, slides.length) } : undefined}
              >
                <Icon name="Camera" className="h-4 w-4" />
                {s.nombre} · Laguna del Chirimoyo
              </span>
            ))}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
