/* AliadosGrid.tsx — rejilla de proyectos aliados, compartida por el preview del
   landing y la página /aliados. Server Component. Tolera logo/url nulos y oculta
   las entradas marcadas como PLACEHOLDER (datos reales llegan con #45). */
import { Icon } from "@/components/ui/Icon";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { mediaUrl, type Aliado } from "@/lib/landing";

/** Una entrada es placeholder mientras su nombre conserve el marcador. */
export function esPlaceholder(a: Aliado): boolean {
  return /placeholder/i.test(a.nombre);
}

/** Mapa tipo → etiqueta legible + tono de insignia. Un tipo fuera del mapa no
    muestra insignia (se tolera sin romper). */
const TIPO: Record<string, { label: string; tone: BadgeTone }> = {
  colectivo: { label: "Colectivo", tone: "forest" },
  ong: { label: "ONG", tone: "teal" },
  academico: { label: "Académico", tone: "ochre" },
  gobierno: { label: "Gobierno", tone: "terra" },
  negocio: { label: "Negocio", tone: "ochre" },
  medio: { label: "Medio", tone: "teal" },
  independiente: { label: "Independiente", tone: "forest" },
};

function Card({ aliado }: { aliado: Aliado }) {
  const logo = mediaUrl(aliado.logo);
  const tipo = TIPO[aliado.tipo];
  const inner = (
    <article className="flex h-full flex-col gap-3 rounded-2xl bg-paper-card p-6 shadow-card ring-1 ring-forest/[0.07] transition-colors group-hover:ring-forest/20">
      <div className="flex items-center gap-3">
        {logo ? (
          /* eslint-disable-next-line @next/next/no-img-element -- logo desde bucket (ADR-0021) */
          <img
            src={logo}
            alt={`Logo de ${aliado.nombre}`}
            loading="lazy"
            className="h-12 w-12 rounded-xl object-contain ring-1 ring-forest/10"
          />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
            <Icon name="Users" className="h-6 w-6" />
          </span>
        )}
        <h3 className="font-serif text-[19px] font-semibold leading-tight text-forest-deep text-balance">
          {aliado.nombre}
        </h3>
      </div>
      <p className="text-[15px] leading-relaxed text-ink/75 text-pretty">
        {aliado.descripcion}
      </p>
      {tipo && (
        <div>
          <Badge tone={tipo.tone}>{tipo.label}</Badge>
        </div>
      )}
      {aliado.url && (
        <span className="mt-auto inline-flex items-center gap-1.5 text-[14px] font-semibold text-forest">
          Visitar
          <Icon name="ArrowUpRight" className="h-4 w-4" />
        </span>
      )}
    </article>
  );

  return aliado.url ? (
    <a
      key={aliado.slug}
      href={aliado.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25 rounded-2xl"
    >
      {inner}
    </a>
  ) : (
    <div key={aliado.slug} className="group">
      {inner}
    </div>
  );
}

export function AliadosGrid({ aliados }: { aliados: Aliado[] }) {
  const reales = aliados.filter((a) => !esPlaceholder(a));

  if (reales.length === 0) {
    return (
      <div className="rounded-2xl bg-paper-card p-8 shadow-card ring-1 ring-forest/[0.07]">
        <p className="text-[16px] leading-relaxed text-ink/75">
          Estamos sumando proyectos aliados. ¿Tu colectivo quiere colaborar con la
          defensa del humedal? Escríbenos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {reales.map((a) => (
        <Card key={a.slug} aliado={a} />
      ))}
    </div>
  );
}
