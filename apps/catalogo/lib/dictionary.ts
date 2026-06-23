/* dictionary.ts — vocabulario de UI del catálogo: etiquetas, iconos y colores
   de cada valor de enum. Portado del handoff de diseño
   (docs/design/buscar-aves/project/assets/birds-data.js). Es UI, no contenido:
   las fichas/CSV guardan solo los ids; aquí viven sus presentaciones. */
import type {
  Forma,
  Tamano,
  Color,
  Donde,
  EstatusMigratorio,
  GradoOcurrencia,
  EstatusDistribucion,
  Nom059,
} from "./fauna-schema";

/** Etiquetas legibles de los enums de estatus, para la ficha de detalle. */
export const MIGRATORIO_LABEL: Record<EstatusMigratorio, string> = {
  residente: "Residente",
  "migratoria-invierno": "Migratoria de invierno",
  "migratoria-verano": "Migratoria de verano",
  transitoria: "Transitoria",
};
export const OCURRENCIA_LABEL: Record<GradoOcurrencia, string> = {
  comun: "Común",
  "poco-comun": "Poco común",
  rara: "Rara",
};
export const DISTRIBUCION_LABEL: Record<EstatusDistribucion, string> = {
  nativa: "Nativa",
  introducida: "Introducida",
};
export const NOM059_LABEL: Record<Nom059, string> = {
  pr: "Protección Especial",
  a: "Amenazada",
  p: "En Peligro",
  e: "Probablemente Extinta",
  ninguno: "",
};

/** Etiquetas legibles del vocabulario semilla de `habitat` (kebab → texto). */
export const HABITAT_LABEL: Record<string, string> = {
  "espejo-de-agua": "Espejo de agua",
  "vegetacion-ribereña": "Vegetación ribereña",
  tular: "Tular",
  "orilla-fangosa": "Orilla fangosa",
  dosel: "Dosel",
  arbustos: "Arbustos",
  pastizal: "Pastizal",
  suelo: "Suelo",
  troncos: "Troncos",
  aire: "Aire",
};

/** Categoría (sub-filtro) en minúsculas como id de filtro. Vocabulario group-aware:
    aves = gremio ecológico; anfibios/reptiles = clase taxonómica. */
export type CategoriaId =
  | "vadeadoras"
  | "nadadoras"
  | "playeras"
  | "voladoras"
  | "rapaces"
  | "terrestres"
  | "anuros"
  | "salamandras"
  | "lagartijas"
  | "serpientes"
  | "tortugas";

/** Presencia derivada para la búsqueda (ver lib/search.ts). */
export type Presencia = "Residente" | "Migratoria" | "Introducida";
/** Grado de observación con etiqueta de búsqueda. */
export type Observacion = "Común" | "Poco Común" | "Raro";
/** Conservación simplificada para el filtro. */
export type Conservacion = "NOM-059" | "Sin Amenaza";

export const CATS: Record<CategoriaId, { label: string; chip: string }> = {
  vadeadoras: { label: "Vadeadoras", chip: "bg-mint-soft text-forest-deep ring-forest/25" },
  nadadoras: { label: "Nadadoras", chip: "bg-[#d8e6f0] text-[#2c5a7a] ring-[#a9c8de]" },
  playeras: { label: "Playeras", chip: "bg-[#ece2cf] text-[#8a6d3b] ring-[#dac8a4]" },
  voladoras: { label: "Voladoras", chip: "bg-[#e6dcef] text-[#6a4d86] ring-[#cdbce0]" },
  rapaces: { label: "Rapaces y Carroñeras", chip: "bg-[#f6e1da] text-[#8f3c25] ring-[#e8c3b6]" },
  terrestres: { label: "Terrestres", chip: "bg-[#e3e9cf] text-[#5e6b22] ring-[#cdd7a8]" },
  // Anfibios
  anuros: { label: "Anuros", chip: "bg-[#dce8d4] text-[#456a2e] ring-[#bcd2a6]" },
  salamandras: { label: "Salamandras", chip: "bg-[#d6e8e2] text-[#2f6b5a] ring-[#aacdc1]" },
  // Reptiles
  lagartijas: { label: "Lagartijas", chip: "bg-[#e8e2cf] text-[#7a6a2f] ring-[#d4c8a4]" },
  serpientes: { label: "Serpientes", chip: "bg-[#e6dccf] text-[#6a533b] ring-[#cdbca4]" },
  tortugas: { label: "Tortugas", chip: "bg-[#d8e0ea] text-[#3b537a] ring-[#aac0de]" },
};

/* "Introducida" reemplaza a "Invasora" del handoff (nuestros datos usan
   estatusDistribucion=introducida; "invasora" es un término cargado y distinto). */
export const PRESENCE: Record<Presencia, { icon: string; label: string }> = {
  Residente: { icon: "house", label: "Residente" },
  Migratoria: { icon: "plane", label: "Migratoria" },
  Introducida: { icon: "alert", label: "Introducida" },
};

export const OBSERVATION: Record<Observacion, { dot: string; label: string }> = {
  Común: { dot: "#15824c", label: "Común" },
  "Poco Común": { dot: "#b08a2e", label: "Poco común" },
  Raro: { dot: "#b5543a", label: "Raro" },
};

export const SHAPES: { id: Forma; label: string }[] = [
  { id: "pato", label: "Pato" },
  { id: "garza", label: "Garza o ibis" },
  { id: "gallineta", label: "Gallineta de pantano" },
  { id: "buceador", label: "Buceador" },
  { id: "playera", label: "Playera de orilla" },
  { id: "rapaz", label: "Rapaz o zopilote" },
  { id: "pajaro", label: "Pájaro pequeño" },
];

export const SIZES: { id: Tamano; label: string; hint: string }[] = [
  { id: "muy-chica", label: "Muy chica", hint: "como un colibrí" },
  { id: "chica", label: "Chica", hint: "como un gorrión" },
  { id: "mediana", label: "Mediana", hint: "como una paloma" },
  { id: "grande", label: "Grande", hint: "como una gallina" },
  { id: "muy-grande", label: "Muy grande", hint: "más que una garza" },
];

export const COLORS: {
  id: Color;
  label: string;
  hex?: string;
  gradient?: string;
  ring?: boolean;
}[] = [
  { id: "blanco", label: "Blanco", hex: "#ffffff", ring: true },
  { id: "negro", label: "Negro", hex: "#23302a" },
  { id: "cafe", label: "Café/marrón", hex: "#7a5631" },
  { id: "gris", label: "Gris", hex: "#9aa3a0" },
  { id: "azul", label: "Azul", hex: "#3f6f9e" },
  { id: "verde", label: "Verde", hex: "#5a8a3c" },
  { id: "amarillo", label: "Amarillo", hex: "#e0b020" },
  { id: "rojo", label: "Rojo o rosa", hex: "#b5543a" },
  { id: "naranja", label: "Naranja/canela", hex: "#c8803c" },
  { id: "iridiscente", label: "Iridiscente", gradient: "linear-gradient(135deg,#2f8d77,#3f6f9e 45%,#6a4d86)" },
];

export const WHERES: { id: Donde; label: string; icon: string }[] = [
  { id: "nadando", label: "Nadando en el agua", icon: "waves" },
  { id: "orilla", label: "Caminando en la orilla o lodo", icon: "pin" },
  { id: "volando", label: "Volando alto", icon: "cloud" },
  { id: "arbol", label: "Posada en árbol o arbusto", icon: "trees" },
  { id: "suelo", label: "En el suelo o pastizal", icon: "sprout" },
  { id: "poste", label: "Sobre poste o rama seca", icon: "post" },
];

/** Atajos que aplican varios filtros a la vez. `patch` usa las claves de Filters. */
export const QUICKS: {
  id: string;
  icon: string;
  title: string;
  desc: string;
  patch: Record<string, unknown>;
}[] = [
  { id: "comunes", icon: "flame", title: "Las más comunes", desc: "Fáciles de avistar", patch: { observaciones: ["Común"] } },
  { id: "dificiles", icon: "eye", title: "Difíciles de ver", desc: "Raras o poco comunes", patch: { observaciones: ["Raro", "Poco Común"] } },
  { id: "migratorias", icon: "plane", title: "Migratorias de invierno", desc: "Visitan en temporada fría", patch: { presencias: ["Migratoria"] } },
  { id: "residentes", icon: "house", title: "Residentes todo el año", desc: "Siempre en la laguna", patch: { presencias: ["Residente"] } },
  { id: "nom059", icon: "shield", title: "Bajo protección NOM-059", desc: "Especies protegidas", patch: { conservaciones: ["NOM-059"] } },
  { id: "agua", icon: "droplet", title: "Aves del agua", desc: "Vadeadoras, nadadoras y playeras", patch: { categorias: ["vadeadoras", "nadadoras", "playeras"] } },
  { id: "tierra", icon: "trees", title: "Aves de tierra y árboles", desc: "Terrestres y voladoras", patch: { categorias: ["terrestres", "voladoras"] } },
  { id: "rapaces", icon: "raptor", title: "Rapaces y carroñeras", desc: "Depredadoras del cielo", patch: { categorias: ["rapaces"] } },
  { id: "destacadas", icon: "star", title: "Destacadas del autor", desc: "Selección de la comunidad", patch: { featured: true } },
];
