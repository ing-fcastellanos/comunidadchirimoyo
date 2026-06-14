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

export interface CatalogData {
  total: number;             // nº de especies
  totalPages: number;        // nº total de páginas del PDF
  edicion: string;
  cover: { photo: string | null; sci: string; logo: string | null };
  species: SpeciesVM[];
  indexPages: IndexPageVM[];
  credits: CreditVM[];
  fuentes: Array<{ name: string; org: string }>;
  qrSitio: string;           // data-URI del QR → landing
  logo: string | null;       // emblema a color (fondo claro)
  logoBlanco: string | null; // emblema blanco/inverso (fondos oscuros)
}
