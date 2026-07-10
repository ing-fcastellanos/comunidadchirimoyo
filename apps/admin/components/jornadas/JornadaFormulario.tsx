"use client";
/* JornadaFormulario.tsx — formulario de crear/editar jornada (#141). Un solo
   componente para los dos modos y los dos `kind`:
   - crear: el usuario elige `kind` con dos botones (se fija al guardar, D5).
   - editar: `kind` se muestra como KindBadge de solo lectura, sin selector
     (inmutable) — pero `recurrencia.tipo` (semanal/mensual-ordinal) sigue
     siendo editable dentro de una jornada recurrente.
   Usa useActionState (React 19) contra el server action pasado en `accion`. */
import { useActionState, useState } from "react";
import { Campo } from "../noticias/Campo";
import { Select } from "./Select";
import { KindBadge } from "./KindBadge";
import { Icon } from "@/components/ui/Icon";
import type { Jornada } from "@/lib/jornadas/types";
import type { JornadaActionState } from "@/lib/jornadas/actions";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";
const ESTADO_INICIAL: JornadaActionState = { ok: false };

const DIAS = [
  { value: "lunes", etiqueta: "Lunes" },
  { value: "martes", etiqueta: "Martes" },
  { value: "miercoles", etiqueta: "Miércoles" },
  { value: "jueves", etiqueta: "Jueves" },
  { value: "viernes", etiqueta: "Viernes" },
  { value: "sabado", etiqueta: "Sábado" },
  { value: "domingo", etiqueta: "Domingo" },
];
const ORDINALES = [1, 2, 3, 4, 5];
const ORDINAL_ETIQUETA: Record<number, string> = { 1: "1º", 2: "2º", 3: "3º", 4: "4º", 5: "5º" };

interface Props {
  modo: "crear" | "editar";
  jornada?: Jornada;
  accion: (prevState: JornadaActionState, formData: FormData) => Promise<JornadaActionState>;
}

export function JornadaFormulario({ modo, jornada, accion }: Props) {
  const [estado, formAction, enviando] = useActionState(accion, ESTADO_INICIAL);
  const errores = estado.errores ?? {};

  const [kindCreando, setKindCreando] = useState<"recurrente" | "evento" | "">("");
  const kind = modo === "editar" ? jornada?.kind : kindCreando;

  const recurrenciaTipoInicial =
    modo === "editar" && jornada?.kind === "recurrente" ? jornada.recurrencia.tipo : "semanal";
  const [recurrenciaTipo, setRecurrenciaTipo] = useState(recurrenciaTipoInicial);

  const diaInicial = modo === "editar" && jornada?.kind === "recurrente" ? jornada.recurrencia.dia : undefined;
  const ordinalesIniciales =
    modo === "editar" && jornada?.kind === "recurrente" && jornada.recurrencia.tipo === "mensual-ordinal"
      ? jornada.recurrencia.ordinales
      : [];
  const [ordinales, setOrdinales] = useState<number[]>(ordinalesIniciales);

  function toggleOrdinal(n: number) {
    setOrdinales((os) => (os.includes(n) ? os.filter((x) => x !== n) : [...os, n].sort()));
  }

  const hayErrores = Object.keys(errores).length > 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center gap-2 text-[13px] text-ink-soft">
        <a href="/jornadas" className={`font-semibold text-forest hover:underline ${FOCO} rounded`}>
          Jornadas
        </a>
        <Icon name="ChevronRight" className="h-3.5 w-3.5" />
        <span>{modo === "crear" ? "Nueva jornada" : "Editar jornada"}</span>
      </div>

      <header className="mb-7">
        <h1 className="font-serif text-[28px] font-semibold leading-tight text-forest-deep">
          {modo === "crear" ? "Nueva jornada" : "Editar jornada"}
        </h1>
        {modo === "editar" && jornada && (
          <div className="mt-2 flex items-center gap-2">
            <KindBadge kind={jornada.kind} />
            <span className="font-mono text-[13px] text-ink-soft">/{jornada.slug}</span>
          </div>
        )}
      </header>

      {estado.error && (
        <div role="alert" className={`mb-6 flex items-start gap-3 rounded-xl bg-[#f6e1da] px-4 py-3.5 text-[14px] font-semibold text-[#8f3c25] ring-1 ring-[#b5543a]/20 ${FOCO}`}>
          <Icon name="TriangleAlert" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{estado.error}</span>
        </div>
      )}
      {hayErrores && (
        <div role="alert" className={`mb-6 flex items-start gap-3 rounded-xl bg-[#f6e1da] px-4 py-3.5 text-[14px] font-semibold text-[#8f3c25] ring-1 ring-[#b5543a]/20 ${FOCO}`}>
          <Icon name="TriangleAlert" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>Revisa los campos marcados abajo antes de guardar.</span>
        </div>
      )}
      {modo === "editar" && estado.ok && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-xl bg-mint-wash px-4 py-3.5 text-[14px] font-semibold text-forest-deep ring-1 ring-forest/15">
          <Icon name="Check" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            Cambios guardados.
            {estado.avisoRevalidacion && ` No se pudo avisar al sitio: ${estado.avisoRevalidacion}`}
          </span>
        </div>
      )}

      <form action={formAction} className="rounded-2xl bg-paper-card p-6 shadow-card ring-1 ring-forest/10 sm:p-8">
        <div className="flex flex-col gap-5">
          {modo === "crear" && (
            <div>
              <label className="mb-1.5 block text-[14px] font-semibold text-ink">
                Tipo de jornada <span className="text-[#b5543a]" aria-hidden="true">*</span>
              </label>
              <input type="hidden" name="kind" value={kindCreando} />
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["recurrente", "Recurrente", "Repeat"],
                    ["evento", "Evento puntual", "Calendar"],
                  ] as const
                ).map(([val, etiqueta, icono]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setKindCreando(val)}
                    className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3.5 text-[14px] font-semibold transition-colors ${FOCO} ${
                      kindCreando === val
                        ? "border-forest bg-mint-wash text-forest-deep"
                        : "border-forest/15 text-ink hover:border-forest/30"
                    }`}
                  >
                    <Icon name={icono} className="h-[18px] w-[18px]" />
                    {etiqueta}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[13px] text-ink-soft/80">No se puede cambiar después de crear la jornada.</p>
            </div>
          )}

          <Campo id="titulo" etiqueta="Título" requerido defaultValue={jornada?.titulo} error={errores.titulo} />

          {modo === "editar" && jornada && (
            <Campo id="slug" etiqueta="Slug (URL)" defaultValue={jornada.slug} disabled ayuda="El slug no se puede editar." />
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Select
              id="tipo"
              etiqueta="Tipo"
              requerido
              defaultValue={jornada?.tipo}
              error={errores.tipo}
              opciones={[
                { value: "limpieza", etiqueta: "Limpieza" },
                { value: "pajareada", etiqueta: "Pajareada" },
                { value: "evento", etiqueta: "Evento" },
              ]}
            />
            <Campo id="hora" etiqueta="Hora" tipo="time" requerido defaultValue={jornada?.hora} error={errores.hora} />
          </div>

          <Campo id="lugar" etiqueta="Lugar" defaultValue={jornada?.lugar ?? ""} placeholder="Opcional" />

          <div className="flex items-center gap-2.5">
            <input
              id="inscripcion"
              name="inscripcion"
              type="checkbox"
              defaultChecked={jornada?.inscripcion ?? true}
              className="h-[18px] w-[18px] rounded border-forest/30 text-forest focus:ring-mint/40"
            />
            <label htmlFor="inscripcion" className="text-[14px] font-semibold text-ink">
              Admite inscripción desde el formulario
            </label>
          </div>

          <Campo id="descripcion" etiqueta="Descripción" textarea filas={2} defaultValue={jornada?.descripcion ?? ""} placeholder="Opcional" />

          {kind === "recurrente" ? (
            <div className="rounded-xl border border-forest/15 bg-paper p-4">
              <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-forest">Regla de recurrencia</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="recurrenciaTipo" className="mb-1.5 block text-[14px] font-semibold text-ink">
                    Frecuencia <span className="text-[#b5543a]" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="recurrenciaTipo"
                    name="recurrenciaTipo"
                    value={recurrenciaTipo}
                    onChange={(e) => setRecurrenciaTipo(e.target.value as "semanal" | "mensual-ordinal")}
                    className={`w-full rounded-xl border border-forest/15 bg-white px-4 h-[48px] text-[15px] text-ink transition-colors hover:border-forest/30 ${FOCO}`}
                  >
                    <option value="semanal">Semanal</option>
                    <option value="mensual-ordinal">Mensual (por ordinal)</option>
                  </select>
                </div>
                <Select id="dia" etiqueta="Día" requerido defaultValue={diaInicial} error={errores.dia} opciones={DIAS} />
              </div>

              {recurrenciaTipo === "mensual-ordinal" && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-[14px] font-semibold text-ink">
                    Ordinales <span className="text-[#b5543a]" aria-hidden="true">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ORDINALES.map((n) => (
                      <label key={n} className="cursor-pointer">
                        <input
                          type="checkbox"
                          name="ordinales"
                          value={n}
                          checked={ordinales.includes(n)}
                          onChange={() => toggleOrdinal(n)}
                          className="peer sr-only"
                        />
                        <span
                          className={`flex h-10 w-14 items-center justify-center rounded-lg border-2 text-[14px] font-bold transition-colors ${FOCO} ${
                            ordinales.includes(n)
                              ? "border-forest bg-mint-wash text-forest-deep"
                              : "border-forest/15 text-ink-soft hover:border-forest/30"
                          }`}
                        >
                          {ORDINAL_ETIQUETA[n]}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errores.ordinales && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#8f3c25]">
                      <Icon name="TriangleAlert" className="h-4 w-4 shrink-0" />
                      {errores.ordinales}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : kind === "evento" ? (
            <div className="rounded-xl border border-forest/15 bg-paper p-4">
              <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-forest">Fecha del evento</p>
              <Campo
                id="fecha"
                etiqueta="Fecha"
                tipo="date"
                requerido
                defaultValue={jornada?.kind === "evento" ? jornada.fecha : undefined}
                error={errores.fecha}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="submit"
            disabled={enviando || (modo === "crear" && !kindCreando)}
            className={`inline-flex h-11 items-center gap-2 rounded-xl bg-forest px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-80 ${FOCO}`}
          >
            {enviando ? (
              <>
                <Icon name="LoaderCircle" className="h-[18px] w-[18px] animate-spin" />
                Guardando…
              </>
            ) : modo === "crear" ? (
              "Crear jornada"
            ) : (
              "Guardar cambios"
            )}
          </button>
          <a href="/jornadas" className={`text-[14px] font-semibold text-ink-soft hover:text-ink ${FOCO} rounded`}>
            Cancelar
          </a>
        </div>
      </form>
    </main>
  );
}
