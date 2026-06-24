/* EspecieCard.tsx — tarjeta de resultado (vistas grid y lista). Portada del handoff
   docs/design/buscar-aves/.../EspecieCard.jsx. */
import type { ReactNode } from "react";
import { Ico } from "./Icons";
import { CATS, PRESENCE, OBSERVATION, SIZES, COLORS, WHERES } from "@/lib/dictionary";
import type { Especie } from "@/lib/search";

function Trait({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group/t relative flex items-center">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-pine-deep px-2.5 py-1 text-[11px] font-medium text-paper opacity-0 shadow-card transition-opacity duration-150 group-hover/t:opacity-100">
        {label}
      </span>
    </div>
  );
}

function CategoryChip({ cat }: { cat: Especie["category"] }) {
  const meta = CATS[cat];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ring-inset backdrop-blur-sm ${meta.chip}`}>
      {meta.label}
    </span>
  );
}

function Pills({ bird }: { bird: Especie }) {
  const pres = PRESENCE[bird.presence];
  const obs = OBSERVATION[bird.observation];
  const protect = bird.conservation === "NOM-059";
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-full bg-paper-deep px-2.5 py-1 text-[12px] font-semibold text-ink-soft">
        <Ico name={pres.icon} className="h-3.5 w-3.5" sw={2.2} /> {pres.label}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-deep px-2.5 py-1 text-[12px] font-semibold text-ink-soft">
        <span className="h-2 w-2 rounded-full" style={{ background: obs.dot }} /> {obs.label}
      </span>
      {protect && (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#f6e1da] px-2.5 py-1 text-[12px] font-semibold text-[#8f3c25]">
          <Ico name="shield" className="h-3.5 w-3.5" sw={2.2} /> NOM-059
        </span>
      )}
    </div>
  );
}

function TraitRow({ bird }: { bird: Especie }) {
  const size = SIZES.find((s) => s.id === bird.size);
  const where = WHERES.find((w) => w.id === bird.where);
  const colorMetas = bird.colors.map((c) => COLORS.find((x) => x.id === c)).filter(Boolean) as typeof COLORS;
  return (
    <div className="flex items-center gap-4 border-t border-forest/[0.08] pt-3 text-forest-soft">
      {size && (
        <Trait label={`Tamaño: ${size.label} (${size.hint})`}>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
            <Ico name="ruler" className="h-4 w-4 text-forest" /> {size.label}
          </span>
        </Trait>
      )}
      {colorMetas.length > 0 && (
        <Trait label={`Color: ${colorMetas.map((c) => c.label).join(", ")}`}>
          <span className="flex items-center gap-1">
            {colorMetas.map((c) => (
              <span key={c.id} className={`h-3.5 w-3.5 rounded-full ${c.ring ? "ring-1 ring-inset ring-forest/25" : ""}`} style={{ background: c.gradient || c.hex }} />
            ))}
          </span>
        </Trait>
      )}
      {where && (
        <Trait label={`Dónde: ${where.label}`}>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft">
            <Ico name={where.icon} className="h-4 w-4 text-forest" />
          </span>
        </Trait>
      )}
    </div>
  );
}

function Figure({ bird, ratioClass }: { bird: Especie; ratioClass: string }) {
  return (
    <figure className={`relative overflow-hidden bg-paper-deep ${ratioClass}`}>
      {bird.img ? (
        // eslint-disable-next-line @next/next/no-img-element -- export estático, imágenes servidas desde el bucket (ADR-0016)
        <img src={bird.img} alt={`${bird.common} (${bird.sci})`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
      ) : (
        <div className="placeholder-stripes flex h-full w-full flex-col items-center justify-center gap-2 text-forest-deep/45 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
          <Ico name="feather" className="h-7 w-7" />
          <span className="px-3 text-center font-mono text-[12px] leading-tight">Foto: {bird.common}</span>
        </div>
      )}
    </figure>
  );
}

export function EspecieCard({ bird, view }: { bird: Especie; view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <article className="group flex flex-col overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.07] transition-all duration-200 hover:-translate-y-0.5 sm:flex-row">
        <div className="relative sm:w-[230px] sm:shrink-0">
          <Figure bird={bird} ratioClass="aspect-[4/3] sm:h-full sm:aspect-auto" />
          <div className="absolute right-2.5 top-2.5"><CategoryChip cat={bird.category} /></div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex-1">
            <h3 className="font-serif text-[24px] font-semibold leading-tight text-forest-deep">{bird.common}</h3>
            <p className="mb-2.5 font-serif text-[16px] italic text-ink-soft/80">{bird.sci}</p>
            <Pills bird={bird} />
            <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-ink/75">{bird.desc}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <TraitRow bird={bird} />
            <a href={bird.href} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-forest px-4 py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-forest-deep">
              Ver ficha <Ico name="arrow-right" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.07] transition-all duration-200 hover:-translate-y-1">
      <div className="relative">
        <Figure bird={bird} ratioClass="aspect-[4/3]" />
        <div className="absolute right-3 top-3"><CategoryChip cat={bird.category} /></div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-[24px] font-semibold leading-tight text-forest-deep">{bird.common}</h3>
        <p className="mb-2.5 font-serif text-[16px] italic text-ink-soft/80">{bird.sci}</p>
        <Pills bird={bird} />
        <p className="mt-2.5 line-clamp-2 min-h-[2.6em] text-[14px] leading-relaxed text-ink/75">{bird.desc}</p>
        <div className="mt-3"><TraitRow bird={bird} /></div>
        <a href={bird.href} className="mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-forest px-4 py-2.5 text-[14px] font-semibold text-paper transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25">
          Ver ficha completa <Ico name="arrow-right" className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
