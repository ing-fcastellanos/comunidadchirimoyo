/* Select.tsx — <select> reutilizable para jornadas (#141), espejo del
   Campo.tsx de noticias pero para opciones cerradas (tipo, día, frecuencia).
   Usado para el enum cerrado de `tipo` (D6: crítico, ver validation.ts). */
import { Icon } from "@/components/ui/Icon";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

interface Opcion {
  value: string;
  etiqueta: string;
}

interface SelectProps {
  id: string;
  etiqueta: string;
  defaultValue?: string;
  opciones: Opcion[];
  error?: string;
  requerido?: boolean;
  disabled?: boolean;
  ayuda?: string;
}

export function Select({ id, etiqueta, defaultValue, opciones, error, requerido, disabled, ayuda }: SelectProps) {
  const base =
    `w-full rounded-xl border bg-white px-4 h-[48px] text-[15px] text-ink transition-colors ${FOCO} ` +
    (error ? "border-[#b5543a] focus-visible:ring-[#b5543a]/30" : "border-forest/15 hover:border-forest/30") +
    (disabled ? " cursor-not-allowed bg-paper opacity-70" : "");

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold text-ink">
        {etiqueta} {requerido && <span className="text-[#b5543a]" aria-hidden="true">*</span>}
      </label>
      <select id={id} name={id} defaultValue={defaultValue ?? ""} disabled={disabled} className={base}>
        <option value="" disabled>
          Selecciona…
        </option>
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.etiqueta}
          </option>
        ))}
      </select>
      {ayuda && !error && <p className="mt-1.5 text-[13px] text-ink-soft/80">{ayuda}</p>}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#8f3c25]">
          <Icon name="TriangleAlert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
