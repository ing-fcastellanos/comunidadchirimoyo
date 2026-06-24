/* secciones.tsx — secciones (server) de la ficha de detalle, portadas del handoff
   docs/design/buscar-aves/.../components. Reusan las primitivas de components/ui. */
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { HABITAT_LABEL, CLASE_LABEL, GRUPO_ICON } from "@/lib/dictionary";
import type { FichaEspecie, Grupo } from "@/lib/fauna-schema";
import type { AudioVista, BadgeVista, DistribucionVista, FotoVista, Secciones, TonoZona } from "@/lib/ficha";
import { MAPA_BASE } from "@/lib/mapa-americas";
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
              <Icon name={GRUPO_ICON[ficha.grupo]} className="h-4 w-4" />
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
  if (ficha.medidas?.tamanoCm) facts.push({ icon: "Ruler", label: ficha.medidas.criterio ?? "Tamaño", value: `${ficha.medidas.tamanoCm[0]}–${ficha.medidas.tamanoCm[1]} cm` });
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

/** Tono de relleno por zona (tokens del sistema de diseño). */
const TONO_FILL: Record<TonoZona, string> = {
  forest: "var(--color-forest)",
  mint: "var(--color-mint)",
  teal: "var(--color-teal)",
};

/** Mapa real (geografía precomputada de Natural Earth, ADR-0018). Geografía +
    marcador de la laguna SIEMPRE; pinta las zonas curadas si las hay. SVG puro,
    sin JS de cliente (export estático, ADR-0014). */
function MapaDistribucion({ dist }: { dist: DistribucionVista }) {
  const { viewBox, marker, outline, regions } = MAPA_BASE;
  const [, , w, h] = viewBox.split(" ").map(Number);
  const zonasTxt = dist.zonas.map((z) => z.label.toLowerCase()).join(", ");
  const aria = dist.curada
    ? `Mapa de las Américas: ${zonasTxt} de la especie, con la Laguna del Chirimoyo marcada en México.`
    : `Mapa de las Américas con la Laguna del Chirimoyo marcada en México (${dist.etiquetaEstatus.toLowerCase()}).`;
  return (
    <svg viewBox={viewBox} className="h-auto w-full max-w-[440px]" role="img" aria-label={aria}>
      <rect x="0" y="0" width={w} height={h} fill="#dcebe4" rx="14" />
      <g stroke="#c4ddd1" strokeWidth="1" opacity="0.7">
        {[0.25, 0.5, 0.75].map((f) => <line key={`h${f}`} x1="0" x2={w} y1={h * f} y2={h * f} />)}
        {[0.25, 0.5, 0.75].map((f) => <line key={`v${f}`} y1="0" y2={h} x1={w * f} x2={w * f} />)}
      </g>
      {/* Tierra base (toda la geografía en vista). */}
      <path d={outline} fill="var(--color-paper)" stroke="var(--color-forest-deep)" strokeWidth="0.6" strokeOpacity="0.35" strokeLinejoin="round" />
      {/* Zonas curadas, pintadas por código ISO sobre la geografía. */}
      {dist.zonas.map((z) =>
        z.codes.map((c) =>
          regions[c] ? <path key={`${z.tono}-${c}`} d={regions[c]} fill={TONO_FILL[z.tono]} fillOpacity="0.82" /> : null,
        ),
      )}
      {/* Marcador fijo de la Laguna del Chirimoyo. */}
      <g>
        <circle cx={marker.x} cy={marker.y} r="11" fill="none" stroke="var(--color-forest-deep)" strokeWidth="1.5" opacity="0.55" />
        <circle cx={marker.x} cy={marker.y} r="4.5" fill="var(--color-forest-deep)" />
      </g>
    </svg>
  );
}

export function DistribucionSec({ texto, dist }: { texto?: string; dist: DistribucionVista }) {
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Rango" icon="Map">Distribución</SectionTitle>
      <div className="grid grid-cols-1 items-center gap-10 rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07] sm:p-10 lg:grid-cols-[440px_1fr]">
        <div className="grid place-items-center">
          <MapaDistribucion dist={dist} />
          {!dist.curada && (
            <p className="mt-3 text-center font-mono text-[11px] text-ink-soft/60">Ubicación de la laguna · rango por especie pendiente de curar</p>
          )}
        </div>
        <div className="space-y-5">
          {texto && <div className="space-y-4 text-[16px] leading-relaxed text-ink/80"><Prosa texto={texto} /></div>}
          {/* Leyenda: estatus + zonas curadas + sitio local. */}
          <ul className="space-y-3 text-[15px] text-ink/85">
            <li className="flex items-center gap-3">
              <span className="grid h-4 w-7 shrink-0 place-items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-forest-deep ring-2 ring-forest/30" />
              </span>
              <span><strong className="font-semibold text-forest-deep">Laguna del Chirimoyo</strong> — Orizaba, Veracruz · {dist.etiquetaEstatus}</span>
            </li>
            {dist.zonas.map((z) => (
              <li key={z.tono} className="flex items-center gap-3">
                <span className="h-4 w-7 shrink-0 rounded-full" style={{ backgroundColor: TONO_FILL[z.tono] }} />
                <span><strong className="font-semibold text-forest-deep">{z.label}</strong></span>
              </li>
            ))}
          </ul>
          {dist.notas && <p className="text-[14px] leading-relaxed text-ink-soft/80">{dist.notas}</p>}
        </div>
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

const TIPO_VOZ_LABEL: Record<string, string> = { canto: "Canto", llamado: "Llamado" };

/** Barras decorativas (estáticas, sin JS) que evocan una onda de sonido. Patrón
    determinista del handoff de diseño; puramente ornamental (aria-hidden). */
const ONDA_NBARS = 40;
const ONDA_ALTURAS = Array.from({ length: ONDA_NBARS }, (_, i) =>
  18 + Math.round(Math.abs(Math.sin(i * 0.7)) * 22 + (i % 3) * 4),
);

function OndaDecorativa() {
  return (
    <div aria-hidden className="mt-7 flex h-24 items-center gap-[3px] rounded-xl bg-black/20 px-4 py-3">
      {ONDA_ALTURAS.map((h, i) => (
        <span key={i} className="flex-1 rounded-full bg-mint" style={{ height: `${h}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

/** Encuadre descriptivo de la vocalización según el grupo (la prosa autoritativa
    vive en el cuerpo; esto es el copy de la banda). Genérico para grupos sin texto propio. */
const VOZ_INTRO: Partial<Record<Grupo, string>> = {
  aves: "Las aves usan la voz para cortejar, defender su territorio y mantenerse en contacto.",
  anfibios: "Las ranas y los sapos cantan sobre todo para atraer pareja y delimitar su territorio, especialmente tras la lluvia.",
};
const VOZ_INTRO_FALLBACK = "Muchas especies usan la voz para comunicarse, cortejar y marcar territorio.";

export function VocalizacionSec({ audios, grupo }: { audios: AudioVista[]; grupo: Grupo }) {
  if (!audios.length) return null;
  const tipos = audios.map((a) => a.tipo).filter(Boolean);
  const titulo =
    tipos.includes("canto") ? "Su canto"
    : tipos.length && tipos.every((t) => t === "llamado") ? "Su llamado"
    : "Su voz";
  const intro = VOZ_INTRO[grupo] ?? VOZ_INTRO_FALLBACK;
  const fuente = audios.find((a) => a.fuenteNombre)?.fuenteNombre;

  return (
    // Banda inmersiva a todo lo ancho (fondo verde profundo), portada del handoff
    // de diseño v0.dev. Reemplaza el canto sintetizado por el audio real.
    <section className="my-6 bg-pine-deep">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.26em] text-mint">
            <Icon name="AudioLines" className="h-4 w-4" />
            Vocalización
          </div>
          <h2 className="font-serif text-[clamp(34px,5vw,52px)] font-semibold leading-[0.98] text-paper">{titulo}</h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-mint-soft/85">
            {intro}
            {fuente && (
              <>
                {" "}Esta es una grabación de campo compartida por la comunidad de
                <span className="font-semibold text-paper"> {fuente}</span>.
              </>
            )}
          </p>
        </div>

        <div className="space-y-6">
          {audios.map((a) => (
            <article key={a.src} className="rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10 sm:p-9">
              {a.tipo && (
                <div className="font-serif text-[22px] font-semibold leading-tight text-paper">{TIPO_VOZ_LABEL[a.tipo] ?? a.tipo}</div>
              )}
              {/* <audio> nativo: sin JS de cliente, compatible con el export estático (ADR-0014). */}
              <audio controls preload="none" src={a.src} className="mt-4 w-full">
                Tu navegador no puede reproducir este audio.
              </audio>
              <OndaDecorativa />
              <p className="mt-5 flex items-start gap-2 text-[13px] leading-relaxed text-mint-soft/60">
                <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {a.creditoUrl ? (
                    <a href={a.creditoUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-mint/30 underline-offset-2 hover:text-mint">{a.credito}</a>
                  ) : (
                    a.credito
                  )}
                  {a.licencia && (
                    <>
                      {" · "}
                      {a.licenciaUrl ? (
                        <a href={a.licenciaUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-mint/30 underline-offset-2 hover:text-mint">{a.licencia}</a>
                      ) : (
                        a.licencia
                      )}
                    </>
                  )}
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
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
    ["Clase", CLASE_LABEL[ficha.grupo]],
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

export function RelacionadasNav({ relacionadas, grupo }: { relacionadas: { grupo: string; slug: string; nombreComun: string; nombreCientifico: string }[]; grupo: Grupo }) {
  if (!relacionadas.length) return null;
  return (
    <Section className="py-12 sm:py-16">
      <SectionTitle kicker="Sigue explorando" icon={GRUPO_ICON[grupo]}>Especies relacionadas</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relacionadas.map((r) => (
          <Link key={r.slug} href={`/${r.grupo}/${r.slug}`} className="group flex items-center justify-between gap-3 rounded-2xl bg-paper-card p-5 shadow-soft ring-1 ring-forest/[0.08] transition-all hover:-translate-y-0.5 hover:ring-forest/25 hover:shadow-card">
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
