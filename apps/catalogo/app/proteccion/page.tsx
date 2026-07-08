import type { Metadata } from "next";
import Link from "next/link";
import { getProteccion, type CategoriaNom059, type Nom059Categoria } from "@/lib/proteccion";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";

/* /proteccion — por qué existen las leyes de protección de fauna (NOM-059,
   IUCN, CITES) y cómo se cruzan con las especies documentadas del humedal del
   Chirimoyo (#78). Server Component estático; contenido curado en
   content/fauna/proteccion.json (ver lib/proteccion.ts). Diseño recreado del
   mockup aprobado en Claude Design (proyecto "Guia aves chirimoyo",
   Proteccion.jsx/Proteccion.html) reusando los primitivos existentes: no
   introduce colores, tipografía ni componentes nuevos. */

export const metadata: Metadata = {
  title: "Protección de especies · Guía de fauna del Chirimoyo",
  description:
    "Qué significan las categorías NOM-059, IUCN y CITES, y qué especies del humedal del Chirimoyo están bajo protección legal.",
  openGraph: {
    title: "Protección de especies · Guía de fauna del Chirimoyo",
    description:
      "Qué significan las categorías de protección de fauna y qué especies del Chirimoyo están amparadas por ellas.",
    type: "website",
    images: [{ url: "/og-fauna.jpg", width: 1200, height: 630, alt: "Guía de la fauna del humedal de Chirimoyo." }],
  },
  twitter: { card: "summary_large_image", images: ["/og-fauna.jpg"] },
};

const NOM059_ICON: Record<CategoriaNom059, IconName> = {
  pr: "Shield",
  a: "ShieldAlert",
  p: "TriangleAlert",
  e: "Skull",
};

function StatCard({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl bg-paper-card p-6 text-center shadow-card ring-1 ring-forest/[0.07]">
      <div className="font-serif text-[40px] font-semibold leading-none text-forest-deep">{n}</div>
      <div className="mt-2 text-[13px] leading-snug text-ink/70">{label}</div>
    </div>
  );
}

function Nom059Card({ cat, label, resumen, especies }: Nom059Categoria) {
  const vacio = especies.length === 0;
  return (
    <article className="rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
          <Icon name={NOM059_ICON[cat]} className="h-5 w-5" />
        </span>
        <Badge tone="terra">
          {cat.toUpperCase()} · {label}
        </Badge>
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{resumen}</p>
      <div className="mt-4 border-t border-forest/[0.07] pt-3">
        {vacio ? (
          <p className="text-[13px] text-ink-soft/70">
            Ninguna especie del humedal está en esta categoría <span className="whitespace-nowrap">(buena noticia).</span>
          </p>
        ) : (
          <p className="text-[13px] leading-relaxed text-ink-soft/80">
            <span className="font-semibold text-forest-deep">En el Chirimoyo: </span>
            {especies.join(", ")}.
          </p>
        )}
      </div>
    </article>
  );
}

export default async function ProteccionPage() {
  const { cifras, nom059, iucn, cites, fuentes } = await getProteccion();

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Section className="pt-14 pb-10 sm:pt-20 sm:pb-14">
        <div className="max-w-2xl">
          <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest-deep">
            Guía de fauna del Chirimoyo
          </p>
          <h1 className="mt-2 font-serif text-[clamp(32px,5vw,50px)] font-semibold leading-[1.05] text-forest-deep text-balance">
            ¿Por qué protegemos estas especies?
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink/80 text-pretty">
            En esta guía verás etiquetas como «Protección Especial» o «Amenazada» junto al nombre de
            varias especies. Aquí explicamos qué significan, qué leyes las respaldan y por qué ese
            reconocimiento importa para un humedal urbano como el Chirimoyo.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard n={cifras.totalEspecies} label="especies documentadas" />
          <StatCard n={cifras.aves} label="son aves" />
          <StatCard n={cifras.anfibiosReptiles} label="anfibios y reptiles" />
          <StatCard n={cifras.conEstatus} label="con categoría de riesgo NOM-059" />
        </div>
      </Section>

      {/* ---------- NOM-059 ---------- */}
      <Section className="py-12 sm:py-16">
        <SectionTitle icon="Scale" kicker="La ley en México">
          NOM-059-SEMARNAT-2010
        </SectionTitle>
        <p className="max-w-2xl text-[16px] leading-relaxed text-ink/80">
          Es la norma oficial que lista las especies en riesgo del país. Si una especie aparece aquí,
          dañarla o capturarla sin permiso es un delito. Va de menor a mayor urgencia, en cuatro
          categorías:
        </p>
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {nom059.map((cat) => (
            <Nom059Card key={cat.cat} {...cat} />
          ))}
        </div>
        <div className="mt-5 flex gap-3 rounded-xl bg-mint-wash/60 p-5 text-[14px] leading-relaxed text-forest-deep/85 ring-1 ring-forest/10">
          <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Es la referencia más importante de esta guía porque es <strong className="font-semibold">ley mexicana
            obligatoria</strong> — a diferencia de la Lista Roja de la UICN (diagnóstico, no ley) y de CITES
            (regula comercio entre países, no protección local).
          </p>
        </div>
      </Section>

      {/* ---------- IUCN ---------- */}
      <Section className="py-12 sm:py-16">
        <SectionTitle icon="Globe" kicker="El diagnóstico mundial">
          Lista Roja de la UICN
        </SectionTitle>
        <p className="max-w-2xl text-[16px] leading-relaxed text-ink/80">
          La Unión Internacional para la Conservación de la Naturaleza evalúa el riesgo de extinción de
          cada especie a nivel global — no es una ley, es un termómetro del planeta.
        </p>
        <div className="mt-7 overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.07]">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-mint-wash text-[11px] font-bold uppercase tracking-[0.16em] text-forest">
                <th className="px-6 py-3 font-bold">Código</th>
                <th className="px-6 py-3 font-bold">Categoría</th>
              </tr>
            </thead>
            <tbody className="text-ink/85">
              {iucn.map((row, i) => (
                <tr key={row.code} className={i ? "border-t border-forest/[0.07]" : ""}>
                  <td className="px-6 py-3 font-mono text-[13px] text-forest">{row.code}</td>
                  <td className="px-6 py-3">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-soft/80">
          Casi todas las especies del humedal están evaluadas como{" "}
          <strong className="font-semibold text-forest-deep">Preocupación Menor (LC)</strong> a nivel
          mundial — ser LC no significa que no necesiten cuidado local: pueden ser comunes en otros
          países pero escasas aquí.
        </p>
      </Section>

      {/* ---------- CITES ---------- */}
      <Section className="py-12 sm:py-16">
        <SectionTitle icon="PackageSearch" kicker="El control de fronteras">
          CITES · comercio internacional
        </SectionTitle>
        <p className="max-w-2xl text-[16px] leading-relaxed text-ink/80">
          Tratado entre países que regula la compra-venta internacional de especies silvestres, para que
          el comercio no las lleve a la extinción.
        </p>
        <article className="mt-7 flex flex-col gap-4 rounded-2xl bg-paper-card p-7 shadow-card ring-1 ring-forest/[0.07] sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-mint-wash font-serif text-[20px] font-semibold text-forest-deep ring-1 ring-forest/10">
            {cites.apendice}
          </span>
          <p className="text-[15px] leading-relaxed text-ink/85">
            <strong className="font-semibold text-forest-deep">{cites.especie}</strong>, presente en el
            Chirimoyo, está en el <strong className="font-semibold">Apéndice {cites.apendice}</strong> de
            CITES: {cites.nota}
          </p>
        </article>
      </Section>

      {/* ---------- Por qué importa ---------- */}
      <Section className="py-12 sm:py-16">
        <div className="rounded-2xl bg-pine px-8 py-12 text-center sm:px-14">
          <h2 className="mx-auto max-w-xl font-serif text-[28px] font-semibold leading-snug text-paper">
            Estas categorías no son solo letras
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-paper/85">
            Detrás de cada «Pr» o «A» hay una especie que depende del humedal para vivir y reproducirse.
            Reconocer al Chirimoyo como el ecosistema vivo que es —con especies bajo protección legal— es
            el argumento central para que reciba los protocolos de cuidado que necesita.
          </p>
          <Link
            href="/busqueda?conservaciones=NOM-059"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-paper px-5 py-2.5 text-[13px] font-semibold text-forest-deep transition-colors hover:bg-mint-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-paper/40"
          >
            Ver especies del Chirimoyo bajo protección
            <Icon name="ArrowRight" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Section>

      {/* ---------- Fuentes y recursos ---------- */}
      <Section className="py-12 sm:py-16">
        <SectionTitle icon="BookOpen" kicker="Para consultar y verificar">
          Fuentes oficiales
        </SectionTitle>
        <div className="mt-2 flex flex-col gap-10">
          {fuentes.map((grupo) => (
            <div key={grupo.rol}>
              <div className="mb-4 flex items-center gap-2.5">
                {grupo.icono && (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
                    <Icon name={grupo.icono} className="h-5 w-5" />
                  </span>
                )}
                <h3 className="font-serif text-[20px] font-semibold leading-tight text-forest-deep">{grupo.rol}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {grupo.enlaces.map((r) => (
                  <a
                    key={r.enlace}
                    href={r.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col rounded-2xl bg-paper-card p-5 shadow-soft ring-1 ring-forest/[0.07] transition-colors hover:ring-forest/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
                  >
                    <span className="font-semibold text-forest-deep">{r.nombre}</span>
                    <span className="mt-1 text-[13px] text-ink-soft/70">{r.fuente}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl border-t border-forest/10 pt-6 text-[13.5px] leading-relaxed text-ink-soft/80">
          Contenido con fines divulgativos, elaborado a partir de fuentes públicas y oficiales (SEMARNAT ·
          DOF · UICN · CITES · CONABIO). No sustituye asesoría legal.
        </p>
      </Section>
    </>
  );
}
