/* secciones.tsx — secciones (server) de la ficha de detalle, portadas del handoff
   docs/design/buscar-aves/.../components. Reusan las primitivas de components/ui. */
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { HABITAT_LABEL } from "@/lib/dictionary";
import type { FichaEspecie } from "@/lib/fauna-schema";
import type { BadgeVista, FotoVista, Secciones } from "@/lib/ficha";
import { FichaCarrusel } from "./FichaCarrusel";

/** Renderiza prosa (uno o más párrafos separados por línea en blanco). */
function Prosa({ texto, className = "" }: { texto: string; className?: string }) {
  return (
    <>
      {texto.split(/\n{2,}/).map((p, i) => (
        <p key={i} className={className}>{p.trim()}</p>
      ))}
    </>
  );
}

export function HeroFicha({ ficha, fotos, badges, resumen }: { ficha: FichaEspecie; fotos: FotoVista[]; badges: BadgeVista[]; resumen: string }) {
  return (
    <header className="border-b border-forest/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch lg:grid-cols-[1.05fr_1fr]">
        <FichaCarrusel fotos={fotos} />
        <div className="flex flex-col justify-center gap-6 bg-paper px-6 py-12 sm:px-12 lg:py-16">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
              <Icon name="Bird" className="h-4 w-4" />
              Ficha de especie · {ficha.categoria}
            </div>
            <h1 className="font-serif text-[clamp(40px,7vw,82px)] font-semibold leading-[0.95] text-forest-deep">{ficha.nombreComun}</h1>
            <p className="mt-2 font-serif text-[clamp(22px,3.2vw,30px)] italic text-forest-soft">
              {ficha.nombreCientifico}{" "}
              {ficha.autoridad && <span className="text-[0.62em] not-italic text-ink-soft/70">{ficha.autoridad}</span>}
            </p>
            {resumen && <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/80">{resumen}</p>}
            {ficha.otrosNombres && ficha.otrosNombres.length > 0 && (
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft/80">
                <span className="font-semibold text-ink">También:</span> {ficha.otrosNombres.join(" · ")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {badges.map((b) => <Badge key={b.label} tone={b.tone}>{b.label}</Badge>)}
          </div>
        </div>
      </div>
    </header>
  );
}

export function QuickFacts({ ficha }: { ficha: FichaEspecie }) {
  const facts: { icon: IconName; label: string; value: string }[] = [];
  if (ficha.medidas?.tamanoCm) facts.push({ icon: "Ruler", label: "Tamaño", value: `${ficha.medidas.tamanoCm[0]}–${ficha.medidas.tamanoCm[1]} cm` });
  if (ficha.envergadura) facts.push({ icon: "MoveHorizontal", label: "Envergadura", value: ficha.envergadura });
  facts.push({ icon: "ListTree", label: "Orden", value: ficha.orden });
  facts.push({ icon: "Feather", label: "Familia", value: ficha.familia });
  if (ficha.habitat?.length) facts.push({ icon: "Trees", label: "Hábitat", value: ficha.habitat.map((h) => HABITAT_LABEL[h] ?? h).join(", ") });
  if (ficha.mejorHora) facts.push({ icon: "Sunrise", label: "Mejor hora", value: ficha.mejorHora });

  return (
    <Section className="py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((q) => (
          <div key={q.label} className="flex items-start gap-3.5 rounded-2xl bg-paper-card p-5 shadow-card ring-1 ring-forest/[0.07]">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep">
              <Icon name={q.icon} className="h-[22px] w-[22px]" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-forest/70">{q.label}</div>
              <div className="mt-0.5 font-serif text-[20px] font-semibold leading-tight text-forest-deep [overflow-wrap:anywhere]">{q.value}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function DescripcionSec({ texto, pullQuote }: { texto: string; pullQuote?: string }) {
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Identificación" icon="Search">Descripción</SectionTitle>
      <div className={`grid grid-cols-1 gap-10 ${pullQuote ? "lg:grid-cols-[1fr_300px]" : ""}`}>
        <div className="space-y-4 text-[17px] leading-[1.75] text-ink/85">
          <Prosa texto={texto} />
        </div>
        {pullQuote && (
          <aside className="self-start rounded-2xl border-l-4 border-mint-deep bg-paper-card p-7 shadow-soft">
            <p className="font-serif text-[24px] leading-snug text-forest-deep">«{pullQuote}»</p>
          </aside>
        )}
      </div>
    </Section>
  );
}

export function DetailCards({ dieta, reproduccion }: { dieta?: string; reproduccion?: string }) {
  if (!dieta && !reproduccion) return null;
  return (
    <Section className="py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {dieta && (
          <article className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
            <SectionTitle kicker="Alimentación" icon="Fish">Dieta y ecología</SectionTitle>
            <div className="space-y-4 text-[17px] leading-[1.75] text-ink/85"><Prosa texto={dieta} /></div>
          </article>
        )}
        {reproduccion && (
          <article className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
            <SectionTitle kicker="Ciclo de vida" icon="Egg">Reproducción</SectionTitle>
            <div className="space-y-4 text-[17px] leading-[1.75] text-ink/85"><Prosa texto={reproduccion} /></div>
          </article>
        )}
      </div>
    </Section>
  );
}

const LAND =
  "M40 120 C30 90 70 78 95 92 L120 86 C150 60 210 58 250 70 C300 80 360 75 372 110 " +
  "C384 140 360 160 348 175 L352 200 C356 225 330 235 312 244 C300 252 296 262 300 275 " +
  "C304 288 292 296 280 290 C270 285 268 272 262 268 L250 270 C240 285 245 305 238 322 " +
  "C232 340 226 352 230 366 C236 384 248 392 256 402 C268 414 262 430 250 432 C240 434 236 424 234 416 " +
  "C230 405 222 400 214 404 C206 408 204 420 196 422 C186 424 184 412 188 402 C192 392 186 384 178 380 " +
  "C168 375 162 360 158 345 C152 322 160 300 150 282 C140 264 120 258 108 248 C92 236 78 226 72 210 " +
  "C64 188 60 168 52 152 C46 140 36 134 40 120 Z";

function MapaEsquematico() {
  return (
    <svg viewBox="0 0 420 470" className="h-auto w-full max-w-[440px]" role="img" aria-label="Mapa esquemático de Norteamérica con la Laguna del Chirimoyo marcada">
      <defs><clipPath id="land-clip"><path d={LAND} /></clipPath></defs>
      <rect x="0" y="0" width="420" height="470" fill="#dcebe4" rx="14" />
      <g stroke="#c4ddd1" strokeWidth="1" opacity="0.8">
        {[80, 160, 240, 320].map((y) => <line key={y} x1="0" x2="420" y1={y} y2={y} />)}
        {[105, 210, 315].map((x) => <line key={x} y1="0" y2="470" x1={x} x2={x} />)}
      </g>
      <g clipPath="url(#land-clip)">
        <rect x="0" y="0" width="420" height="470" fill="#eef5ef" />
      </g>
      <path d={LAND} fill="none" stroke="#0c5a36" strokeWidth="2" strokeOpacity="0.5" strokeLinejoin="round" />
      <g>
        <circle cx="222" cy="300" r="11" fill="none" stroke="#0c5a36" strokeWidth="1.5" opacity="0.5" />
        <circle cx="222" cy="300" r="4.5" fill="#0c5a36" />
      </g>
    </svg>
  );
}

export function DistribucionSec({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Rango" icon="Map">Distribución</SectionTitle>
      <div className="grid grid-cols-1 items-center gap-10 rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07] sm:p-10 lg:grid-cols-[440px_1fr]">
        <div className="grid place-items-center">
          <MapaEsquematico />
          <p className="mt-3 text-center font-mono text-[11px] text-ink-soft/60">Mapa esquemático · ubicación de la laguna (geografía detallada por especie: pendiente)</p>
        </div>
        <div className="space-y-4 text-[16px] leading-relaxed text-ink/80"><Prosa texto={texto} /></div>
      </div>
    </Section>
  );
}

export function ObservacionSec({ comoIdentificarla, dondeObservarla }: { comoIdentificarla?: string; dondeObservarla?: string }) {
  const cards: { icon: IconName; title: string; body: string }[] = [];
  if (comoIdentificarla) cards.push({ icon: "Eye", title: "Cómo identificarla", body: comoIdentificarla });
  if (dondeObservarla) cards.push({ icon: "MapPin", title: "Dónde y cuándo", body: dondeObservarla });
  if (!cards.length) return null;
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="En el campo" icon="Binoculars">Claves para observación</SectionTitle>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map((o) => (
          <article key={o.title} className="flex flex-col rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07]">
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-mint-wash text-forest-deep">
              <Icon name={o.icon} className="h-6 w-6" />
            </span>
            <h3 className="font-serif text-[24px] font-semibold text-forest-deep">{o.title}</h3>
            <div className="mt-2 space-y-3 text-[16px] leading-relaxed text-ink/80"><Prosa texto={o.body} /></div>
          </article>
        ))}
      </div>
    </Section>
  );
}

const IUCN_LABEL: Record<string, string> = {
  LC: "Preocupación Menor", NT: "Casi Amenazada", VU: "Vulnerable",
  EN: "En Peligro", CR: "En Peligro Crítico", DD: "Datos Insuficientes", NE: "No Evaluada",
};
const NOM_FULL: Record<string, string> = {
  pr: "Protección Especial (Pr)", a: "Amenazada (A)", p: "En Peligro (P)", e: "Probablemente Extinta (E)",
};

export function ConservacionSec({ ficha, sabiasQue }: { ficha: FichaEspecie; sabiasQue?: string }) {
  const { nom059, iucn, notas } = ficha.conservacion;
  return (
    <Section className="py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <article className="rounded-2xl bg-mint-wash p-8 ring-1 ring-forest/10">
          <SectionTitle kicker="Estatus" icon="ShieldCheck">Conservación</SectionTitle>
          <ul className="space-y-3 text-[16px] leading-relaxed text-ink/85">
            {nom059 !== "ninguno" ? (
              <li className="flex gap-3"><Icon name="Check" className="mt-1 h-4 w-4 shrink-0 text-forest" /><span><strong className="font-semibold text-forest-deep">{NOM_FULL[nom059]}</strong> según la NOM-059-SEMARNAT.</span></li>
            ) : (
              <li className="flex gap-3"><Icon name="Check" className="mt-1 h-4 w-4 shrink-0 text-forest" /><span>Sin categoría de riesgo en la NOM-059-SEMARNAT.</span></li>
            )}
            {iucn && (
              <li className="flex gap-3"><Icon name="Globe" className="mt-1 h-4 w-4 shrink-0 text-forest" /><span><strong className="font-semibold text-forest-deep">{IUCN_LABEL[iucn] ?? iucn} ({iucn})</strong> a nivel global según la UICN.</span></li>
            )}
            {notas && <li className="flex gap-3"><Icon name="TriangleAlert" className="mt-1 h-4 w-4 shrink-0 text-ochre" /><span>{notas}</span></li>}
          </ul>
        </article>
        {sabiasQue && (
          <article className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
            <SectionTitle kicker="Aspectos adicionales" icon="Sparkles">¿Sabías que…?</SectionTitle>
            <div className="space-y-4 text-[16px] leading-relaxed text-ink/85"><Prosa texto={sabiasQue} /></div>
          </article>
        )}
      </div>
    </Section>
  );
}

export function TaxonomiaSec({ ficha }: { ficha: FichaEspecie }) {
  const filas: [string, string][] = [
    ["Reino", "Animalia"],
    ["Filo", "Chordata"],
    ["Clase", "Aves"],
    ["Orden", ficha.orden],
    ["Familia", ficha.familia],
    ["Género", ficha.genero],
    ["Especie", ficha.nombreCientifico],
  ];
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Clasificación" icon="GitFork">Taxonomía</SectionTitle>
      <div className="overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.07]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-mint-wash text-[12px] font-bold uppercase tracking-[0.18em] text-forest">
              <th className="px-7 py-4">Nivel</th><th className="px-7 py-4">Taxón</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(([nivel, taxon]) => (
              <tr key={nivel} className="bg-paper-card">
                <td className="border-t border-forest/[0.08] px-7 py-3.5 text-[16px] font-semibold text-forest-soft">{nivel}</td>
                <td className={`border-t border-forest/[0.08] px-7 py-3.5 text-[17px] text-ink ${nivel === "Género" || nivel === "Especie" ? "font-serif text-[19px] italic" : ""}`}>{taxon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function RelacionadasNav({ relacionadas }: { relacionadas: { slug: string; nombreComun: string; nombreCientifico: string }[] }) {
  if (!relacionadas.length) return null;
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Sigue explorando" icon="Bird">Especies relacionadas</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relacionadas.map((r) => (
          <Link key={r.slug} href={`/aves/${r.slug}`} className="group flex items-center justify-between gap-3 rounded-2xl bg-paper-card p-5 shadow-soft ring-1 ring-forest/[0.08] transition-all hover:-translate-y-0.5 hover:ring-forest/25 hover:shadow-card">
            <span className="min-w-0">
              <span className="block truncate font-serif text-[20px] font-semibold text-forest-deep">{r.nombreComun}</span>
              <span className="block truncate font-serif text-[14px] italic text-ink-soft/75">{r.nombreCientifico}</span>
            </span>
            <Icon name="ArrowRight" className="h-5 w-5 shrink-0 text-forest transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Section>
  );
}
