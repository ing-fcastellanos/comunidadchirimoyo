/* DestacadasFauna.tsx — sección «Especies destacadas del humedal» del hub (#83).
   Server Component: recibe las especies ya marcadas como destacadas (featured) y
   las presenta como grilla de EspecieCard, cross-grupo, enlazando al detalle. La
   selección proviene del flag `featured` del contenido (resuelto en app/page.tsx),
   no se hardcodea aquí; este componente solo ORDENA para intercalar grupos. Si no
   hay destacadas, no renderiza nada. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { EspecieCard } from "@/components/search/EspecieCard";
import type { Especie } from "@/lib/search";

/* Orden de presentación por slug: intercala aves/anfibios/reptiles para que la
   fila lea como «fauna», no como bloque de aves. Es ORDEN, no selección —los slugs
   fuera de esta lista caen al final, estables por nombre común. */
const ORDEN_DESTACADAS = [
  "psarocolius-montezuma",   // ave — registro local emblemático
  "bolitoglossa-platydactyla", // anfibio — única salamandra, NOM-059
  "egretta-thula",           // ave — garza dedos dorados
  "thamnophis-proximus",     // reptil — culebra listonada
  "nannopterum-brasilianum", // ave — cormorán neotropical
  "lithobates-berlandieri",  // anfibio — rana leopardo
];

function ordenar(especies: Especie[]): Especie[] {
  const rank = (id: string) => {
    const i = ORDEN_DESTACADAS.indexOf(id);
    return i === -1 ? ORDEN_DESTACADAS.length : i;
  };
  return [...especies].sort(
    (a, b) => rank(a.id) - rank(b.id) || a.common.localeCompare(b.common, "es"),
  );
}

export function DestacadasFauna({ especies }: { especies: Especie[] }) {
  if (especies.length === 0) return null;
  const destacadas = ordenar(especies);

  return (
    <Section className="py-14 sm:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-forest-deep">
            <Icon name="Sparkles" className="h-4 w-4" />
            El catálogo
          </p>
          <h2 className="mt-2 font-serif text-[clamp(28px,4vw,40px)] font-semibold leading-[1.08] text-forest-deep text-balance">
            Especies destacadas del humedal
          </h2>
          <p className="mt-2 text-[16px] leading-relaxed text-ink/75 text-pretty">
            Algunas especies con historia propia en la laguna que defendemos —de aves a herpetofauna.
          </p>
        </div>
        <Link
          href="/busqueda"
          className="group inline-flex shrink-0 items-center gap-2 text-[15px] font-semibold text-forest-deep transition-colors hover:text-forest focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 rounded-md"
        >
          Ver todas
          <Icon name="ArrowRight" className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destacadas.map((e) => (
          <EspecieCard key={e.id} bird={e} view="grid" />
        ))}
      </div>
    </Section>
  );
}
