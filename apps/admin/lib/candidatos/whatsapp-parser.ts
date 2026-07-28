/* whatsapp-parser.ts — parseo del export nativo de WhatsApp ("Exportar chat",
   sin medios; candidatos-admin, design.md D1). Formato esperado por línea:
     DD/MM/YY, HH:mm - Remitente: mensaje
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

const CABECERA = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}):(\d{2})\s*-\s*([^:]+):\s(.*)$/;
const BOM = /^﻿/;

function aFecha(dia: string, mes: string, anio: string, hora: string, minuto: string): Date | null {
  const d = Number(dia);
  const m = Number(mes);
  const h = Number(hora);
  const min = Number(minuto);
  const y = anio.length === 2 ? 2000 + Number(anio) : Number(anio);
  const fecha = new Date(y, m - 1, d, h, min);
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
      const [, dia, mes, anio, hora, minuto, remitente, texto] = match;
      const fecha = aFecha(dia, mes, anio, hora, minuto);
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
