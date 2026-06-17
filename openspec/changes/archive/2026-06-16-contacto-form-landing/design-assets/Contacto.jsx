/* global React, window */
"use client";
/* =====================================================================
   Contacto.jsx — página /contacto de Comunidad Chirimoyo.
   Componente cliente autónomo: formulario accesible + 4 estados
   (idle · submitting · success · error) con validación local.
   Sin backend: onSubmit simula el envío. Sin librerías externas.

   Prop opcional `estadoInicial` ("idle"|"submitting"|"success"|"error")
   y `erroresIniciales` solo para previsualizar estados.
   ===================================================================== */
const { useState, useRef } = React;
const { useLucide, Icon } = window;

const FOCO =
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

const VACIO = { nombre: "", correo: "", asunto: "", mensaje: "", consent: false, website: "" };

/* validación: devuelve { campo: mensaje } solo con los inválidos */
function validar(v) {
  const e = {};
  if (!v.nombre.trim()) e.nombre = "Escribe tu nombre.";
  if (!v.correo.trim()) e.correo = "Escribe tu correo.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo.trim()))
    e.correo = "El correo no es válido.";
  if (!v.asunto.trim()) e.asunto = "Escribe un asunto.";
  if (!v.mensaje.trim()) e.mensaje = "Escribe tu mensaje.";
  else if (v.mensaje.trim().length < 10)
    e.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  if (!v.consent) e.consent = "Debes aceptar el aviso de privacidad para continuar.";
  return e;
}

/* ---------- ícono SVG propio (no depende de lucide) ---------- */
const Flecha = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
  </svg>
);
const Spinner = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
    </path>
  </svg>
);
const Hoja = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6" />
  </svg>
);
const Check = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const Alerta = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 9v4" /><path d="M12 17h.01" />
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
  </svg>
);

/* ---------- campo de texto reutilizable ---------- */
function Campo({ id, etiqueta, tipo = "text", valor, onChange, error, requerido, disabled, textarea, ...props }) {
  const errId = error ? `${id}-error` : undefined;
  const base =
    `w-full rounded-xl border bg-white px-4 text-[16px] text-ink placeholder:text-ink-soft/45 transition-colors ${FOCO} ` +
    (error
      ? "border-[#b5543a] focus-visible:ring-[#b5543a]/30"
      : "border-forest/15 hover:border-forest/30") +
    (disabled ? " cursor-not-allowed opacity-60" : "");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-600 text-ink">
        {etiqueta}{" "}
        {requerido && <span className="text-[#b5543a]" aria-hidden="true">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={6}
          value={valor}
          onChange={onChange}
          disabled={disabled}
          aria-required={requerido}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          className={`${base} py-3 leading-relaxed resize-y min-h-[140px]`}
          {...props}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={tipo}
          value={valor}
          onChange={onChange}
          disabled={disabled}
          aria-required={requerido}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          className={`${base} h-[52px]`}
          {...props}
        />
      )}
      {error && (
        <p id={errId} className="mt-1.5 flex items-center gap-1.5 text-[13px] font-600 text-[#8f3c25]">
          <Alerta className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Contacto({ estadoInicial = "idle", erroresIniciales = {} }) {
  useLucide();
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState(erroresIniciales);
  const [estado, setEstado] = useState(estadoInicial); // idle|submitting|success|error
  const alertaRef = useRef(null);

  const enviando = estado === "submitting";
  const set = (campo) => (e) => {
    const val = campo === "consent" ? e.target.checked : e.target.value;
    setValores((v) => ({ ...v, [campo]: val }));
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (valores.website) return; // honeypot: bot detectado, ignorar en silencio

    const errs = validar(valores);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      setEstado("error");
      setTimeout(() => alertaRef.current && alertaRef.current.focus(), 0);
      return;
    }
    setErrores({});
    setEstado("submitting");
    /* simulación de envío (sin backend) */
    setTimeout(() => setEstado("success"), 1400);
  };

  /* ---------- estado: éxito ---------- */
  if (estado === "success") {
    return (
      <main className="mx-auto max-w-[640px] px-6 py-16 sm:py-24">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center rounded-xl bg-paper-card px-8 py-12 text-center shadow-card ring-1 ring-forest/10"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-mint-wash text-forest-deep ring-1 ring-forest/15">
            <Check className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-serif text-[34px] font-600 leading-tight text-forest-deep text-balance sm:text-[40px]">
            ¡Gracias!
          </h1>
          <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-ink-soft text-pretty">
            Recibimos tu mensaje y te responderemos pronto.
          </p>
          <a
            href="/"
            className={`mt-7 inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 text-[16px] font-600 text-white transition-colors hover:bg-forest-deep ${FOCO}`}
          >
            Volver al inicio
            <Flecha className="h-[18px] w-[18px]" />
          </a>
        </div>
      </main>
    );
  }

  /* ---------- estados: idle / submitting / error ---------- */
  const hayErrores = estado === "error" && Object.keys(errores).length > 0;

  return (
    <main className="mx-auto max-w-[640px] px-6 py-14 sm:py-20">
      {/* intro */}
      <header className="mb-9 text-center">
        <span className="inline-flex items-center gap-2 font-mono text-[12px] font-700 uppercase tracking-[0.22em] text-forest">
          <Hoja className="h-4 w-4" />
          Escríbenos
        </span>
        <h1 className="mt-3 font-serif text-[clamp(34px,7vw,52px)] font-600 leading-[1.05] text-forest-deep text-balance">
          Hablemos sobre el humedal
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-ink-soft text-pretty">
          ¿Tienes una pregunta, quieres sumarte como voluntaria, eres prensa o
          buscas una alianza? Cuéntanos: nos encanta saber de la comunidad.
        </p>
      </header>

      {/* tarjeta del formulario */}
      <div className="rounded-xl bg-paper-card p-6 shadow-card ring-1 ring-forest/10 sm:p-8">
        {/* resumen de error */}
        {hayErrores && (
          <div
            ref={alertaRef}
            role="alert"
            tabIndex={-1}
            className={`mb-6 flex items-start gap-3 rounded-xl bg-[#f6e1da] px-4 py-3.5 text-[15px] font-600 text-[#8f3c25] ring-1 ring-[#b5543a]/20 ${FOCO}`}
          >
            <Alerta className="mt-0.5 h-5 w-5 shrink-0" />
            <span>No se pudo enviar tu mensaje. Revisa los campos marcados e inténtalo de nuevo.</span>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <Campo id="nombre" etiqueta="Nombre" valor={valores.nombre} onChange={set("nombre")}
            error={errores.nombre} requerido disabled={enviando} autoComplete="name" placeholder="¿Cómo te llamas?" />
          <Campo id="correo" etiqueta="Correo" tipo="email" valor={valores.correo} onChange={set("correo")}
            error={errores.correo} requerido disabled={enviando} autoComplete="email" placeholder="tucorreo@ejemplo.org" />
          <Campo id="asunto" etiqueta="Asunto" valor={valores.asunto} onChange={set("asunto")}
            error={errores.asunto} requerido disabled={enviando} placeholder="¿De qué quieres hablarnos?" />
          <Campo id="mensaje" etiqueta="Mensaje" textarea valor={valores.mensaje} onChange={set("mensaje")}
            error={errores.mensaje} requerido disabled={enviando} placeholder="Escribe tu mensaje aquí…" />

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
                className={`mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded-md border-forest/30 text-forest accent-forest ${FOCO}`}
              />
              <span>
                He leído y acepto el{" "}
                <a href="/privacidad" className={`font-600 text-forest underline underline-offset-2 hover:text-forest-deep ${FOCO}`}>
                  aviso de privacidad
                </a>.{" "}
                <span className="text-[#b5543a]" aria-hidden="true">*</span>
              </span>
            </label>
            {errores.consent && (
              <p id="consent-error" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-600 text-[#8f3c25]">
                <Alerta className="h-4 w-4 shrink-0" />
                {errores.consent}
              </p>
            )}
          </div>

          {/* botón enviar */}
          <button
            type="submit"
            disabled={enviando}
            className={`mt-1 inline-flex h-[56px] items-center justify-center gap-2.5 rounded-xl bg-forest px-7 text-[17px] font-700 text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-80 ${FOCO}`}
          >
            {enviando ? (
              <>
                <Spinner className="h-5 w-5" />
                Enviando…
              </>
            ) : (
              <>
                Enviar mensaje
                <Flecha className="h-5 w-5" />
              </>
            )}
          </button>

          {/* línea de privacidad tranquilizadora */}
          <p className="text-center text-[13px] leading-relaxed text-ink-soft">
            Cuidamos tus datos. Solo los usamos para responderte; nunca los compartimos.
          </p>
        </form>
      </div>

      {/* región viva para el estado de envío (lectores de pantalla) */}
      <div role="status" aria-live="polite" className="sr-only">
        {enviando ? "Enviando tu mensaje…" : ""}
      </div>
    </main>
  );
}

window.Contacto = Contacto;
window.validarContacto = validar;
