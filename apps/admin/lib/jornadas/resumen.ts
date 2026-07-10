/* resumen.ts — texto legible de la regla/fecha de una jornada, para la lista
   del admin (#141). Función pura, sin dependencias de servidor: segura de
   importar en un Client Component. */
import type { DiaSemana, Jornada } from "./types";

const DIA_ETIQUETA: Record<DiaSemana, string> = {
  lunes: "lunes",
  martes: "martes",
  miercoles: "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  sabado: "sábado",
  domingo: "domingo",
};

const ORDINAL_ETIQUETA: Record<number, string> = { 1: "1º", 2: "2º", 3: "3º", 4: "4º", 5: "5º" };

export function resumenRegla(j: Jornada): string {
  if (j.kind === "evento") {
    const [y, m, d] = j.fecha.split("-").map(Number);
    if (!y || !m || !d) return j.fecha;
    const fecha = new Date(y, m - 1, d).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `Evento único · ${fecha}`;
  }

  const dia = DIA_ETIQUETA[j.recurrencia.dia] ?? j.recurrencia.dia;
  if (j.recurrencia.tipo === "semanal") return `Cada ${dia}`;

  const ordinales = j.recurrencia.ordinales.map((o) => ORDINAL_ETIQUETA[o] ?? String(o)).join(" y ");
  return `${ordinales} ${dia} de cada mes`;
}
