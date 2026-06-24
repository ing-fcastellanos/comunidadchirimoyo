/* ficha.ts — utilidades de la ficha de detalle: parseo de las secciones `##`
   del cuerpo, view-models (fotos, badges) y especies relacionadas. */
import { fotoUrl, audioUrl, type FichaEspecie, type TipoVocalizacion } from "./fauna-schema";
import {
  MIGRATORIO_LABEL,
  OCURRENCIA_LABEL,
  DISTRIBUCION_LABEL,
  NOM059_LABEL,
} from "./dictionary";
import type { BadgeTone } from "@/components/ui/Badge";

export interface Secciones {
  descripcion?: string;
  dietaEcologia?: string;
  reproduccion?: string;
  distribucion?: string;
  comoIdentificarla?: string;
  dondeObservarla?: string;
  sabiasQue?: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[áàä]/g, "a")
    .replace(/[éèë]/g, "e")
    .replace(/[íìï]/g, "i")
    .replace(/[óòö]/g, "o")
    .replace(/[úùü]/g, "u")
    .replace(/[¿?]/g, "")
    .trim();

const SECCION_KEY: Record<string, keyof Secciones> = {
  descripcion: "descripcion",
  "dieta y ecologia": "dietaEcologia",
  reproduccion: "reproduccion",
  distribucion: "distribucion",
  "como identificarla": "comoIdentificarla",
  "donde y cuando observarla": "dondeObservarla",
  "sabias que": "sabiasQue",
};

/** Divide el cuerpo Markdown en sus secciones `##` (insensible a acentos/caso). */
export function parseSecciones(cuerpo: string): Secciones {
  const res: Secciones = {};
  const re = /^##\s+(.+?)\s*$/gm;
  const matches = [...cuerpo.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const titulo = matches[i][1];
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? cuerpo.length : cuerpo.length;
    const key = SECCION_KEY[norm(titulo)];
    if (key) res[key] = cuerpo.slice(start, end).trim();
  }
  return res;
}

/** Primera oración de la descripción (para metadata/resumen). */
export function resumenDescripcion(secciones: Secciones): string {
  const d = secciones.descripcion ?? "";
  const fin = d.indexOf(". ");
  return fin > 0 ? d.slice(0, fin + 1) : d;
}

export interface FotoVista {
  src: string;
  alt: string;
  credito: string;
  licencia?: string;
  creditoUrl?: string;
  licenciaUrl?: string;
}

/** Fotos de la especie con la URL de la variante `web` del bucket. */
export function fotosVista(f: FichaEspecie): FotoVista[] {
  return f.fotos.map((p) => ({
    src: fotoUrl(f.slug, p.archivo, "web"),
    alt: p.alt,
    credito: p.credito,
    licencia: p.licencia,
    creditoUrl: p.creditoUrl,
    licenciaUrl: p.licenciaUrl,
  }));
}

export interface AudioVista {
  src: string;
  tipo?: TipoVocalizacion;
  /** Crédito compuesto: `"<credito>, <fuenteId>, <fuente>"` (fuente derivada del dato). */
  credito: string;
  /** Nombre legible de la fuente de la grabación (p. ej. "xeno-canto", "iNaturalist"). */
  fuenteNombre?: string;
  licencia?: string;
  creditoUrl?: string;
  licenciaUrl?: string;
}

/** Fuente de una grabación, derivada del dato (no hardcodeada). El prefijo del
    `fuenteId` es la señal primaria; si no se reconoce, se cae al host de
    `creditoUrl`; si tampoco, queda indefinida (sin inventar atribución). */
export function fuenteAudio(
  fuenteId?: string,
  creditoUrl?: string,
): { nombre: string; dominio: string } | undefined {
  if (fuenteId) {
    if (/^XC/i.test(fuenteId)) return { nombre: "xeno-canto", dominio: "xeno-canto.org" };
    if (/^iNat/i.test(fuenteId)) return { nombre: "iNaturalist", dominio: "iNaturalist" };
  }
  if (creditoUrl) {
    try {
      const host = new URL(creditoUrl).hostname.replace(/^www\./, "");
      if (host) return { nombre: host, dominio: host };
    } catch {
      /* creditoUrl no parseable: sin fuente */
    }
  }
  return undefined;
}

/** Audios de la especie con la URL del bucket y el crédito compuesto desde los
    campos (no se almacena la leyenda; i18n-ready, ADR-0011). La fuente se deriva
    del dato (xeno-canto / iNaturalist / host de creditoUrl), no se hardcodea. */
export function audiosVista(f: FichaEspecie): AudioVista[] {
  return (f.audios ?? []).map((a) => {
    const fuente = fuenteAudio(a.fuenteId, a.creditoUrl);
    const partes = [a.credito, a.fuenteId, fuente?.dominio].filter(Boolean);
    return {
      src: audioUrl(f.slug, a.archivo),
      tipo: a.tipo,
      credito: partes.join(", "),
      fuenteNombre: fuente?.nombre,
      licencia: a.licencia,
      creditoUrl: a.creditoUrl,
      licenciaUrl: a.licenciaUrl,
    };
  });
}

export interface BadgeVista {
  tone: BadgeTone;
  label: string;
}

/** Badges de estatus del hero (migratorio · ocurrencia · conservación · distribución). */
export function badgesDe(f: FichaEspecie): BadgeVista[] {
  const b: BadgeVista[] = [
    { tone: "forest", label: MIGRATORIO_LABEL[f.estatusMigratorio] },
    { tone: f.gradoOcurrencia === "comun" ? "forest" : "ochre", label: OCURRENCIA_LABEL[f.gradoOcurrencia] },
  ];
  if (f.conservacion.nom059 !== "ninguno") {
    b.push({ tone: "terra", label: `${NOM059_LABEL[f.conservacion.nom059]} · NOM-059` });
  }
  b.push({ tone: "teal", label: DISTRIBUCION_LABEL[f.estatusDistribucion] });
  return b;
}

export type TonoZona = "forest" | "mint" | "teal";

export interface ZonaVista {
  tono: TonoZona;
  label: string;
  /** Códigos ISO a rellenar en el mapa base. */
  codes: string[];
}

export interface DistribucionVista {
  /** Zonas curadas a pintar (vacío si no hay `distribucion`). */
  zonas: ZonaVista[];
  /** Etiqueta derivada de `estatusMigratorio` (p. ej. "Residente"). */
  etiquetaEstatus: string;
  notas?: string;
  /** true si la ficha trae `distribucion` con al menos una zona. */
  curada: boolean;
}

/** View-model del mapa de distribución: zonas curadas + etiqueta de estatus.
    Sin `distribucion`, `zonas` queda vacío y el mapa cae al render por defecto
    (geografía + marcador + etiqueta), sin inventar rango. Ver ADR-0018. */
export function distribucionVista(f: FichaEspecie): DistribucionVista {
  const d = f.distribucion;
  const zonas: ZonaVista[] = [];
  if (d?.residente?.length) zonas.push({ tono: "teal", label: "Presencia anual", codes: d.residente });
  if (d?.cria?.length) zonas.push({ tono: "forest", label: "Zona de cría", codes: d.cria });
  if (d?.invernada?.length) zonas.push({ tono: "mint", label: "Zona de invernada", codes: d.invernada });
  return {
    zonas,
    etiquetaEstatus: MIGRATORIO_LABEL[f.estatusMigratorio],
    notas: d?.notas,
    curada: zonas.length > 0,
  };
}

/** Especies relacionadas del mismo grupo: misma familia primero, luego misma categoría. */
export function relacionadas(actual: FichaEspecie, todas: FichaEspecie[], n = 6): FichaEspecie[] {
  const otras = todas.filter((f) => f.slug !== actual.slug && f.grupo === actual.grupo);
  const familia = otras.filter((f) => f.familia === actual.familia);
  const categoria = otras.filter((f) => f.familia !== actual.familia && f.categoria === actual.categoria);
  return [...familia, ...categoria].slice(0, n);
}
