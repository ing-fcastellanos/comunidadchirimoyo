/* types.ts — view-models que el orquestador (build-pdf.mts) construye a partir
   de las fichas de content/ y pasa a las plantillas de impresión. */

export interface Medida { k: string; v: string; u: string }
export interface StatusChip { tone: string; value: string; label: string }

export interface SpeciesVM {
  n: number;                 // folio (número de página de la ficha)
  slug: string;
  gremio: string;
  gremioTone: { bg: string; fg: string };
  common: string;
  sci: string;
  authority: string;
  otros: string;
  photo: string | null;      // data-URI o null (placeholder)
  photoCaption: string;
  credit: string;
  license: string;
  status: StatusChip[];
  iucn: { code: string; tone: string };
  nom: string;
  orden: string;
  familia: string;
  genero: string;
  medidas: Medida[];
  habitat: string;
  cuando: string;
  blocks: { desc?: string; id?: string; sabias?: string; donde?: string };
  qr: string;                // data-URI del QR → ficha web
}

/* Ítems del índice ya repartidos en columnas/páginas por el orquestador. */
export type IndexItem =
  | { kind: "guild"; key: string; dot: string; count: number }
  | { kind: "row"; name: string; sci: string; pg: number };

export interface IndexPageVM {
  columns: [IndexItem[], IndexItem[]];
  showHeader: boolean;       // solo la primera página del índice lleva cabecera
  totalGuilds: number;
}

export interface CreditVM { name: string; count: number; license?: string }

/* Copy de marca específico de la disciplina (ornitología vs herpetología).
   Lo construye el orquestador desde la config y lo consumen las plantillas
   Cover/IntroLegend/Closing, en vez de cadenas «aves» hardcodeadas. */
export interface CatalogMeta {
  coverTituloLineas: string[]; // líneas del h1 de portada antes de «Chirimoyo»
  introTitulo: string;         // h2 de la introducción
  introParrafo: string;        // 2º párrafo de la introducción
  observaPista: string;        // texto del paso «Observa y compara»
  sitioLabel: string;          // etiqueta del QR del sitio (p. ej. fauna.chirimoyo.org)
  footerTitulo: string;        // título del pie de la página de cierre
  indiceSubtitulo: string;     // subtítulo del índice (p. ej. «… agrupadas por gremio/clase»)
  categoriaPlural: string;     // rótulo del conteo de categorías («gremios» | «clases»)
}

export interface CatalogData {
  total: number;             // nº de especies
  totalPages: number;        // nº total de páginas del PDF
  edicion: string;
  meta: CatalogMeta;         // copy de marca por disciplina
  cover: { photo: string | null; sci: string; logo: string | null };
  species: SpeciesVM[];
  indexPages: IndexPageVM[];
  credits: CreditVM[];
  fuentes: Array<{ name: string; org: string }>;
  qrSitio: string;           // data-URI del QR → landing
  logo: string | null;       // emblema a color (fondo claro)
  logoBlanco: string | null; // emblema blanco/inverso (fondos oscuros)
}
