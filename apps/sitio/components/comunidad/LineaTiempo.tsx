/* LineaTiempo.tsx — línea de tiempo vertical de logros de la comunidad.
   Portado del handoff v0.dev (components/LineaTiempo.jsx). Server Component
   (sin estado ni eventos). Recibe los hitos YA ordenados y con la foto resuelta;
   tolera `foto: null` sin mostrar huecos rotos. */
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { Hito, Logros } from "@/lib/landing";

/* tipo → ícono lucide (PascalCase, como espera el wrapper Icon) */
const TIPO_ICONO: Record<string, IconName> = {
  hito: "Flag",
  jornada: "Trash2",
  festival: "PartyPopper",
  reforestacion: "TreePine",
  divulgacion: "Megaphone",
  ciencia: "Microscope",
  reconocimiento: "Award",
};

const TIPO_LABEL: Record<string, string> = {
  hito: "Hito",
  jornada: "Jornada",
  festival: "Festival",
  reforestacion: "Reforestación",
  divulgacion: "Divulgación",
  ciencia: "Ciencia",
  reconocimiento: "Reconocimiento",
};

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/* "YYYY-MM" o "YYYY-MM-DD" → "Ene 2023" / "14 Feb 2025" (tolerante a basura) */
function formatearFecha(fecha: string): string {
  if (typeof fecha !== "string") return "";
  const partes = fecha.split("-");
  const anio = partes[0];
  const mes = parseInt(partes[1], 10);
  const dia = partes[2] ? parseInt(partes[2], 10) : null;
  if (!anio || isNaN(mes) || mes < 1 || mes > 12) return fecha;
  const etiquetaMes = MESES[mes - 1];
  return dia ? `${dia} ${etiquetaMes} ${anio}` : `${etiquetaMes} ${anio}`;
}

function HitoItem({ hito, ultimo }: { hito: Hito; ultimo: boolean }) {
  const { fecha, titulo, descripcion, tipo, foto } = hito;
  const icono = TIPO_ICONO[tipo] ?? "CircleDot";
  const etiqueta = TIPO_LABEL[tipo] ?? null;

  return (
    <li className="relative flex gap-4 pb-10 last:pb-0 sm:gap-6">
      {/* riel: nodo + línea de unión */}
      <div className="relative flex flex-col items-center">
        <span className="z-10 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
          <Icon name={icono} className="h-6 w-6" />
        </span>
        {!ultimo && (
          <span aria-hidden="true" className="mt-2 w-px flex-1 rounded bg-forest/15" />
        )}
      </div>

      {/* contenido */}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <time className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-forest-deep">
            {formatearFecha(fecha)}
          </time>
          {etiqueta && (
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-forest/45">
              {etiqueta}
            </span>
          )}
        </div>

        <div className="mt-2 rounded-2xl bg-paper-card p-5 shadow-card ring-1 ring-forest/[0.07] sm:p-6">
          <h3 className="font-serif text-[24px] font-semibold leading-tight text-forest-deep text-pretty">
            {titulo}
          </h3>
          {descripcion && (
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft text-pretty">
              {descripcion}
            </p>
          )}
          {foto && (
            /* eslint-disable-next-line @next/next/no-img-element -- foto servida desde public/ (interino) o bucket (ADR-0021) */
            <img
              src={foto}
              alt={titulo || "Foto del logro"}
              loading="lazy"
              className="mt-4 h-40 w-full max-w-xs rounded-xl object-cover ring-1 ring-forest/10 sm:h-44"
            />
          )}
        </div>
      </div>
    </li>
  );
}

export function LineaTiempo({ data }: { data: Logros }) {
  if (!data.hitos || data.hitos.length === 0) return null;

  return (
    <Section className="py-14 sm:py-20">
      <SectionTitle icon="History" kicker="Lo que hemos logrado">
        {data.titulo}
      </SectionTitle>
      {data.resumen && (
        <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-ink/75 text-pretty">
          {data.resumen}
        </p>
      )}

      <ol className="mt-2">
        {data.hitos.map((hito, i) => (
          <HitoItem
            key={`${hito.fecha}-${i}`}
            hito={hito}
            ultimo={i === data.hitos.length - 1}
          />
        ))}
      </ol>
    </Section>
  );
}
