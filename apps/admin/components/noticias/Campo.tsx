/* Campo.tsx — campo de formulario reutilizable para noticias (#140), espejo
   del patrón `Campo` de app/login/form.tsx y Contacto.jsx (proyecto Claude
   Design): label + input/textarea + error por-campo + texto de ayuda. */
import { Icon } from "@/components/ui/Icon";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

interface CampoProps {
  id: string;
  etiqueta: string;
  tipo?: string;
  defaultValue?: string;
  error?: string;
  requerido?: boolean;
  disabled?: boolean;
  ayuda?: string;
  textarea?: boolean;
  filas?: number;
  placeholder?: string;
}

export function Campo({
  id,
  etiqueta,
  tipo = "text",
  defaultValue,
  error,
  requerido,
  disabled,
  ayuda,
  textarea,
  filas = 4,
  placeholder,
}: CampoProps) {
  const errId = error ? `${id}-error` : undefined;
  const base =
    `w-full rounded-xl border bg-white px-4 text-[15px] text-ink placeholder:text-ink-soft/45 transition-colors ${FOCO} ` +
    (error ? "border-[#b5543a] focus-visible:ring-[#b5543a]/30" : "border-forest/15 hover:border-forest/30") +
    (disabled ? " cursor-not-allowed bg-paper opacity-70" : "");

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold text-ink">
        {etiqueta} {requerido && <span className="text-[#b5543a]" aria-hidden="true">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={filas}
          defaultValue={defaultValue}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          placeholder={placeholder}
          className={`${base} resize-y py-3 leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={tipo}
          defaultValue={defaultValue}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          placeholder={placeholder}
          className={`${base} h-[48px]`}
        />
      )}
      {ayuda && !error && <p className="mt-1.5 text-[13px] text-ink-soft/80">{ayuda}</p>}
      {error && (
        <p id={errId} className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#8f3c25]">
          <Icon name="TriangleAlert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
