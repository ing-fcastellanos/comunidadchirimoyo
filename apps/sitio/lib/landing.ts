/* landing.ts — loader SERVER-ONLY del contenido del landing (content/landing/).
   Lee y tipa lucha.md (frontmatter + cuerpo) y los JSON (actividades, logros,
   enlaces, donaciones, aliados) en build. Importa node:fs/path, así que NO debe
   importarse desde Client Components (solo los TIPOS son seguros en cliente).

   Fuente de verdad: content/landing/ (ADR-0004). Ningún texto ni ruta de imagen
   se hardcodea en los componentes; todo se deriva de aquí. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { IconName } from "@/components/ui/Icon";

/** Raíz del contenido (content/). Override con CONTENT_DIR. */
export const CONTENT_ROOT =
  process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "../../content");

export const LANDING_DIR = path.join(CONTENT_ROOT, "landing");

/** Base de medios de comunidad (ADR-0021). Por defecto el bucket público de GCS;
    override con NEXT_PUBLIC_COMUNIDAD_CDN_BASE si migra a un dominio/CDN propio.
    Vacío ("") serviría desde public/ del sitio (fallback de desarrollo). */
const MEDIA_BASE =
  process.env.NEXT_PUBLIC_COMUNIDAD_CDN_BASE ??
  "https://storage.googleapis.com/comunidad-chirimoyo";

/** Compone la URL de una foto a partir de su ruta relativa, codificando cada
    segmento (los nombres del bucket pueden tener espacios). Devuelve null si no
    hay foto, para que los componentes puedan omitir la imagen sin romperse. */
export function mediaUrl(rel: string | null | undefined): string | null {
  if (!rel) return null;
  if (/^https?:\/\//.test(rel)) return rel;
  const encoded = rel
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return MEDIA_BASE ? `${MEDIA_BASE.replace(/\/+$/, "")}/${encoded}` : `/${encoded}`;
}

// ===== Tipos =====

export interface Lucha {
  titulo: string;
  resumen: string;
  actualizado: string | null;
  estado: string | null;
  casoFoto: string | null;
  casoFotoAlt: string | null;
  /** Secciones del cuerpo (## Encabezado → párrafos), en orden. */
  secciones: { titulo: string; cuerpo: string }[];
}

export interface FotoGaleria {
  slug: string;
  archivo: string;
  alt: string;
  pie: string;
  orientacion: "horizontal" | "vertical";
  hero: boolean;
}
export interface Galeria {
  titulo: string;
  resumen: string;
  fotos: FotoGaleria[];
}

/** Slide del hero ya con la URL resuelta. */
export interface HeroSlide {
  slug: string;
  src: string;
  alt: string;
  pie: string;
}

/** Foto de galería con la URL ya resuelta (lista para render). */
export interface FotoResuelta {
  slug: string;
  src: string;
  alt: string;
  pie: string;
  orientacion: "horizontal" | "vertical";
}

export interface Actividad {
  slug: string;
  titulo: string;
  descripcion: string;
  icono: IconName;
}
export interface Actividades {
  titulo: string;
  resumen: string;
  actividades: Actividad[];
}

export interface Hito {
  fecha: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  foto: string | null;
}
export interface Logros {
  titulo: string;
  resumen: string;
  hitos: Hito[];
}

export interface SitioEnlace {
  slug: string;
  titulo: string;
  descripcion: string;
  url: string;
  icono: IconName;
}
export interface RedEnlace {
  red: string;
  titulo: string;
  url: string;
  icono: IconName;
}
export interface Enlaces {
  sitios: SitioEnlace[];
  redes: RedEnlace[];
  contacto: { email: string; telefono: string; telefonoDisplay: string };
  jornadas: { titulo: string; calendarioUrl: string };
  ubicacion: {
    nombre: string;
    ciudad: string;
    mapsUrl: string;
    lat: number;
    lng: number;
  };
}

export interface MetodoDonacion {
  tipo: string;
  titulo: string;
  descripcion: string;
  icono: IconName;
  clabe?: string;
  clabeDisplay?: string;
  beneficiario?: string;
  banco?: string;
  url?: string;
  contactoEmail?: string;
}
export interface Donaciones {
  titulo: string;
  intro: string;
  metodos: MetodoDonacion[];
}

export interface Aliado {
  slug: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  url: string | null;
  logo: string | null;
}
export interface Aliados {
  titulo: string;
  resumen: string;
  aliados: Aliado[];
}

// ===== Loaders =====

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(LANDING_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

/** Lee lucha.md: frontmatter tipado + cuerpo partido en secciones `## ...`.
    Las líneas de comentario HTML (<!-- ... -->) se ignoran. */
export async function getLucha(): Promise<Lucha> {
  const raw = await readFile(path.join(LANDING_DIR, "lucha.md"), "utf8");
  const { data, content } = matter(raw);

  const cuerpo = content.replace(/<!--[\s\S]*?-->/g, "").trim();
  const secciones: { titulo: string; cuerpo: string }[] = [];
  const re = /^##\s+(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  const heads: { titulo: string; start: number; end: number }[] = [];
  while ((m = re.exec(cuerpo)) !== null) {
    heads.push({ titulo: m[1].trim(), start: m.index, end: re.lastIndex });
  }
  heads.forEach((h, i) => {
    const bodyStart = h.end;
    const bodyEnd = i + 1 < heads.length ? heads[i + 1].start : cuerpo.length;
    const body = cuerpo.slice(bodyStart, bodyEnd).replace(/\s+\n/g, "\n").trim();
    secciones.push({ titulo: h.titulo, cuerpo: body });
  });

  const str = (v: unknown) =>
    typeof v === "string" && v.trim().length > 0 ? (v as string) : null;

  return {
    titulo: str(data.titulo) ?? "",
    resumen: str(data.resumen) ?? "",
    actualizado: str(data.actualizado),
    estado: str(data.estado),
    casoFoto: str(data.casoFoto),
    casoFotoAlt: str(data.casoFotoAlt),
    secciones,
  };
}

export const getActividades = () => readJson<Actividades>("actividades.json");
export const getEnlaces = () => readJson<Enlaces>("enlaces.json");
export const getDonaciones = () => readJson<Donaciones>("donaciones.json");
export const getAliados = () => readJson<Aliados>("aliados.json");
export const getGaleria = () => readJson<Galeria>("galeria.json");

/** Slides del hero: las fotos de la galería marcadas con `hero: true`, en orden,
    con la URL ya resuelta. Si ninguna lo está, cae a la primera foto. */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { fotos } = await getGaleria();
  const elegidas = fotos.filter((f) => f.hero);
  const fuente = elegidas.length > 0 ? elegidas : fotos.slice(0, 1);
  return fuente
    .map((f) => ({
      slug: f.slug,
      src: mediaUrl(f.archivo) ?? "",
      alt: f.alt,
      pie: f.pie,
    }))
    .filter((s) => s.src);
}

/** Hitos reales (sin placeholder), ordenados cronológicamente y con la foto ya
    resuelta a URL. Los componentes toleran foto null; aquí además ocultamos las
    entradas marcadas como PLACEHOLDER (los datos reales llegan con #45). */
export async function getLogros(): Promise<Logros> {
  const logros = await readJson<Logros>("logros.json");
  const esPlaceholder = (h: Hito) =>
    /placeholder/i.test(h.titulo ?? "") || /placeholder/i.test(h.descripcion ?? "");
  const hitos = logros.hitos
    .filter((h) => !esPlaceholder(h))
    .map((h) => ({ ...h, foto: mediaUrl(h.foto) }))
    .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""));
  return { ...logros, hitos };
}

/** Fotos de la galería con la URL ya resuelta, en orden del manifiesto. */
export async function getGaleriaFotos(): Promise<FotoResuelta[]> {
  const { fotos } = await getGaleria();
  return fotos
    .map((f) => ({
      slug: f.slug,
      src: mediaUrl(f.archivo) ?? "",
      alt: f.alt,
      pie: f.pie,
      orientacion: f.orientacion,
    }))
    .filter((f) => f.src);
}
