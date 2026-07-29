/* whatsapp-parser.ts — parseo del export nativo de WhatsApp ("Exportar chat",
   sin medios; candidatos-admin, design.md D1). Tolerante a las variantes
   reales que produce WhatsApp según el teléfono/locale de quien exporta:
     12/31/25, 11:57 AM - Remitente: mensaje       (Android, 12h, US)
     31/12/25, 23:57 - Remitente: mensaje          (Android, 24h, es-MX)
     [31/12/25, 11:57:03 p. m.] Remitente: mensaje (iPhone, con corchetes y segundos)
   El orden día/mes NO es fijo entre grupos (cada quien exporta desde su
   propio teléfono) — se resuelve con una heurística: si uno de los dos
   números > 12, ese es el día sin ambigüedad; si ambos son ≤12, se asume
   DD/MM (ver resolverDiaMes).

   Los mensajes de sistema (cambios de grupo, aviso de cifrado, etc.)
   comparten la cabecera de fecha pero no tienen "Remitente:" — se ignoran.
   Líneas que no matchean la cabecera se tratan como continuación del mensaje
   anterior (mensajes multilínea); si no hay mensaje anterior, se descartan
   (degradación suave — riesgo de design.md: no falla todo el archivo por una
   línea con formato inesperado). */

export interface MensajeWhatsapp {
  fecha: Date;
  remitente: string;
  texto: string;
}

const CABECERA =
  /^\[?(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?\s?m\.?)?\]?\s*-?\s*([^:]+):\s(.*)$/i;
const BOM = /^﻿/;

/** WhatsApp usa el formato de fecha del teléfono que exportó (DD/MM o
    MM/DD) — no se puede asumir uno fijo. Si uno de los dos números supera
    12, ese es inequívocamente el día; si ambos son ≤12 (caso ambiguo), se
    asume DD/MM. */
function resolverDiaMes(a: number, b: number): [dia: number, mes: number] {
  if (a > 12) return [a, b];
  if (b > 12) return [b, a];
  return [a, b];
}

/** Convierte a 24h si el renglón trae marcador AM/PM; si no, asume que la
    hora ya viene en 24h (Android es-MX típico). */
function normalizarHora(hora: number, ampm: string | undefined): number {
  if (!ampm) return hora;
  const esPM = /p/i.test(ampm);
  const h = hora % 12;
  return esPM ? h + 12 : h;
}

function aFecha(
  g1: string,
  g2: string,
  anioStr: string,
  horaStr: string,
  minutoStr: string,
  ampm: string | undefined,
): Date | null {
  const [dia, mes] = resolverDiaMes(Number(g1), Number(g2));
  const y = anioStr.length === 2 ? 2000 + Number(anioStr) : Number(anioStr);
  const h = normalizarHora(Number(horaStr), ampm);
  const min = Number(minutoStr);
  const fecha = new Date(y, mes - 1, dia, h, min);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** Parsea el texto completo de un export a mensajes de usuario (excluye
    mensajes de sistema, que no tienen remitente). Se asume orden cronológico,
    como produce siempre el export nativo de WhatsApp. */
export function parsearExportWhatsapp(contenido: string): MensajeWhatsapp[] {
  const lineas = contenido.replace(BOM, "").split(/\r?\n/);
  const mensajes: MensajeWhatsapp[] = [];

  for (const linea of lineas) {
    const match = CABECERA.exec(linea);
    if (match) {
      const [, g1, g2, anio, hora, minuto, ampm, remitente, texto] = match;
      const fecha = aFecha(g1, g2, anio, hora, minuto, ampm);
      if (fecha) {
        mensajes.push({ fecha, remitente: remitente.trim(), texto });
        continue;
      }
    }

    // Continuación de un mensaje multilínea (o línea irreconocible): se
    // anexa al último mensaje si existe; si no, se descarta.
    const anterior = mensajes[mensajes.length - 1];
    if (anterior && linea.trim()) {
      anterior.texto += `\n${linea}`;
    }
  }

  return mensajes;
}

/** Mensajes con fecha posterior al corte (exclusivo). `corte === null`
    incluye todos los mensajes (primera subida de un grupo). */
export function filtrarPosterioresA(mensajes: MensajeWhatsapp[], corte: Date | null): MensajeWhatsapp[] {
  if (!corte) return mensajes;
  return mensajes.filter((m) => m.fecha.getTime() > corte.getTime());
}

/** Agrupa mensajes en lotes acotados por tamaño de texto, no por cantidad
    (mensajes muy cortos o muy largos varían mucho). La PRIMERA subida de un
    grupo (sin corte previo) puede traer meses de historial completo — muy
    grande para una sola llamada a la IA (riesgo de exceder el contexto del
    modelo o truncar la respuesta) — por eso se procesa en lotes; el Route
    Handler (subir/route.ts) procesa uno por request y el cliente
    (SubirExportForm) reintenta automáticamente hasta agotarlos. */
export function dividirEnLotes(mensajes: MensajeWhatsapp[], maxCaracteres = 12000): MensajeWhatsapp[][] {
  const lotes: MensajeWhatsapp[][] = [];
  let loteActual: MensajeWhatsapp[] = [];
  let caracteresActual = 0;

  for (const m of mensajes) {
    const tamano = m.texto.length + m.remitente.length + 20; // margen por fecha/formato
    if (loteActual.length > 0 && caracteresActual + tamano > maxCaracteres) {
      lotes.push(loteActual);
      loteActual = [];
      caracteresActual = 0;
    }
    loteActual.push(m);
    caracteresActual += tamano;
  }
  if (loteActual.length > 0) lotes.push(loteActual);

  return lotes;
}
