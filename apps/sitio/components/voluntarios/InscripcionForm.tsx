"use client";
/* InscripcionForm.tsx — formulario de inscripción de voluntarios (#22a). Espejo
   del formulario de contacto: Client Component con 4 estados (idle · submitting ·
   success · error), validación accesible (espejo del backend #21) y honeypot
   `website`. El envío va por el Server Action `enviarInscripcion`; nunca llama al
   API directo. Se monta dentro de /voluntarios (la página aporta intro y jornadas). */
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { enviarInscripcion } from "@/app/actions/inscripcion";
import {
  validarInscripcion,
  VALORES_VACIOS,
  type CamposInscripcion,
  type CampoConError,
  type ErroresInscripcion,
} from "@/lib/inscripcion-validacion";
import { cn } from "@/lib/utils";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

type Estado = "idle" | "submitting" | "success" | "error";

function Flecha({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
    </svg>
  );
}
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function Alerta({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4" /><path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

type CampoProps = {
  id: CampoConError;
  etiqueta: string;
  valor: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  requerido?: boolean;
  disabled?: boolean;
  tipo?: string;
  autoComplete?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  ayuda?: string;
};

function Campo({ id, etiqueta, valor, onChange, error, requerido, disabled, tipo = "text", autoComplete, placeholder, min, max, ayuda }: CampoProps) {
  const errId = error ? `${id}-error` : undefined;
  const ayudaId = ayuda ? `${id}-ayuda` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold text-ink">
        {etiqueta}{" "}
        {requerido ? (
          <span className="text-terra" aria-hidden="true">*</span>
        ) : (
          <span className="font-normal text-ink-soft/70">(opcional)</span>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        inputMode={tipo === "number" ? "numeric" : undefined}
        min={min}
        max={max}
        value={valor}
        onChange={onChange}
        disabled={disabled}
        aria-required={requerido}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(errId, ayudaId) || undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn(
          "h-[52px] w-full rounded-xl border bg-paper-card px-4 text-[16px] text-ink placeholder:text-ink-soft/45 transition-colors",
          FOCO,
          error ? "border-terra focus-visible:ring-terra/30" : "border-forest/15 hover:border-forest/30",
          disabled && "cursor-not-allowed opacity-60",
        )}
      />
      {ayuda && !error && (
        <p id={ayudaId} className="mt-1.5 text-[13px] text-ink-soft">{ayuda}</p>
      )}
      {error && (
        <p id={errId} className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-terra-deep">
          <Alerta className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function InscripcionForm() {
  const [valores, setValores] = useState<CamposInscripcion>(VALORES_VACIOS);
  const [errores, setErrores] = useState<ErroresInscripcion>({});
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensajeError, setMensajeError] = useState<string>("");
  const alertaRef = useRef<HTMLDivElement>(null);

  const enviando = estado === "submitting";

  const set =
    (campo: keyof CamposInscripcion) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = campo === "consent" ? e.target.checked : e.target.value;
      setValores((v) => ({ ...v, [campo]: val }));
      if (campo !== "website" && errores[campo as CampoConError]) {
        setErrores((er) => ({ ...er, [campo]: undefined }));
      }
    };

  const mostrarError = (msg: string, errs: ErroresInscripcion = {}) => {
    setErrores(errs);
    setMensajeError(msg);
    setEstado("error");
    setTimeout(() => alertaRef.current?.focus(), 0);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    if (valores.website) return; // honeypot: bot, ignorar en silencio

    const errs = validarInscripcion(valores);
    if (Object.keys(errs).length > 0) {
      mostrarError("No se pudo enviar tu inscripción. Revisa los campos marcados e inténtalo de nuevo.", errs);
      return;
    }

    setErrores({});
    setMensajeError("");
    setEstado("submitting");

    const r = await enviarInscripcion(valores);
    if (r.ok) {
      setEstado("success");
    } else if (r.tipo === "validacion") {
      mostrarError("No se pudo enviar tu inscripción. Revisa los campos marcados e inténtalo de nuevo.", r.errores);
    } else {
      mostrarError("No se pudo enviar tu inscripción. Inténtalo de nuevo en un momento.");
    }
  };

  /* ---------- estado: éxito ---------- */
  if (estado === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center rounded-xl bg-paper-card px-8 py-12 text-center shadow-card ring-1 ring-forest/10"
      >
        <span className="grid h-16 w-16 place-items-center rounded-full bg-mint-wash text-forest-deep ring-1 ring-forest/15">
          <Check className="h-8 w-8" />
        </span>
        <h3 className="mt-6 font-serif text-[30px] font-semibold leading-tight text-forest-deep text-balance">
          ¡Gracias por sumarte!
        </h3>
        <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-ink-soft text-pretty">
          Recibimos tu inscripción. Te compartiremos los detalles de la jornada por correo.
        </p>
      </div>
    );
  }

  /* ---------- estados: idle / submitting / error ---------- */
  const hayErrores = estado === "error";

  return (
    <div className="rounded-xl bg-paper-card p-6 shadow-card ring-1 ring-forest/10 sm:p-8">
      {hayErrores && (
        <div
          ref={alertaRef}
          role="alert"
          tabIndex={-1}
          className={cn("mb-6 flex items-start gap-3 rounded-xl bg-terra-wash px-4 py-3.5 text-[15px] font-semibold text-terra-deep ring-1 ring-terra/20", FOCO)}
        >
          <Alerta className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{mensajeError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Campo id="nombre" etiqueta="Nombre" valor={valores.nombre} onChange={set("nombre")}
          error={errores.nombre} requerido disabled={enviando} autoComplete="name" placeholder="¿Cómo te llamas?" />
        <Campo id="correo" etiqueta="Correo" tipo="email" valor={valores.correo} onChange={set("correo")}
          error={errores.correo} requerido disabled={enviando} autoComplete="email" placeholder="tucorreo@ejemplo.org" />
        <Campo id="telefono" etiqueta="Teléfono" tipo="tel" valor={valores.telefono} onChange={set("telefono")}
          error={errores.telefono} disabled={enviando} autoComplete="tel" placeholder="Para coordinar la jornada" />
        <Campo id="jornada" etiqueta="Jornada o fecha" valor={valores.jornada} onChange={set("jornada")}
          error={errores.jornada} disabled={enviando} placeholder="p. ej. la próxima jornada o una fecha" />
        <Campo id="acompanantes" etiqueta="Acompañantes" tipo="number" min={0} max={20} valor={valores.acompanantes}
          onChange={set("acompanantes")} error={errores.acompanantes} disabled={enviando}
          ayuda="¿Cuántas personas vienen contigo? (0 si vienes solo)" />

        {/* honeypot anti-spam: fuera de pantalla, oculto a lectores y teclado */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
          <label htmlFor="website">No llenar este campo</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off"
            value={valores.website} onChange={set("website")} />
        </div>

        {/* consentimiento */}
        <div>
          <label htmlFor="consent" className="flex items-start gap-3 text-[15px] leading-snug text-ink">
            <input
              id="consent" name="consent" type="checkbox"
              checked={valores.consent} onChange={set("consent")}
              disabled={enviando} aria-required="true"
              aria-invalid={errores.consent ? true : undefined}
              aria-describedby={errores.consent ? "consent-error" : undefined}
              className={cn("mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded-md border-forest/30 text-forest accent-forest", FOCO)}
            />
            <span>
              He leído y acepto el{" "}
              <Link href="/privacidad" className={cn("font-semibold text-forest underline underline-offset-2 hover:text-forest-deep", FOCO)}>
                aviso de privacidad
              </Link>.{" "}
              <span className="text-terra" aria-hidden="true">*</span>
            </span>
          </label>
          {errores.consent && (
            <p id="consent-error" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-terra-deep">
              <Alerta className="h-4 w-4 shrink-0" />
              {errores.consent}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={enviando}
          className={cn("mt-1 inline-flex h-[56px] items-center justify-center gap-2.5 rounded-xl bg-forest px-7 text-[17px] font-bold text-paper-card shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-80", FOCO)}
        >
          {enviando ? (
            <>
              <Spinner className="h-5 w-5" />
              Enviando…
            </>
          ) : (
            <>
              Quiero sumarme
              <Flecha className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="text-center text-[13px] leading-relaxed text-ink-soft">
          Cuidamos tus datos. Solo los usamos para organizar las jornadas; nunca los compartimos.
        </p>
      </form>

      <div role="status" aria-live="polite" className="sr-only">
        {enviando ? "Enviando tu inscripción…" : ""}
      </div>
    </div>
  );
}
