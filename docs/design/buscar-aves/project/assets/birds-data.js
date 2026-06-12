/* birds-data.js — datos de muestra y definiciones de filtros para la búsqueda
   de aves de la Laguna del Chirimoyo. Plano (sin JSX) → expone window.SEARCH_DATA */

/* ---- metadatos de categoría (color del chip por grupo) ---- */
const CATS = {
  vadeadoras: { label: 'Vadeadoras',            chip: 'bg-mint-soft text-forest-deep ring-forest/25' },
  nadadoras:  { label: 'Nadadoras',             chip: 'bg-[#d8e6f0] text-[#2c5a7a] ring-[#a9c8de]' },
  playeras:   { label: 'Playeras',              chip: 'bg-[#ece2cf] text-[#8a6d3b] ring-[#dac8a4]' },
  voladoras:  { label: 'Voladoras',             chip: 'bg-[#e6dcef] text-[#6a4d86] ring-[#cdbce0]' },
  rapaces:    { label: 'Rapaces y Carroñeras',  chip: 'bg-[#f6e1da] text-[#8f3c25] ring-[#e8c3b6]' },
  terrestres: { label: 'Terrestres',            chip: 'bg-[#e3e9cf] text-[#5e6b22] ring-[#cdd7a8]' },
};

/* ---- presencia / observación / conservación ---- */
const PRESENCE = {
  'Residente':  { icon: 'house', label: 'Residente' },
  'Migratoria': { icon: 'plane', label: 'Migratoria' },
  'Invasora':   { icon: 'alert', label: 'Invasora' },
};
const OBSERVATION = {
  'Común':       { dot: '#15824c', label: 'Común' },
  'Poco Común':  { dot: '#b08a2e', label: 'Poco común' },
  'Raro':        { dot: '#b5543a', label: 'Raro' },
};

/* ---- dimensiones de filtro ---- */
const SHAPES = [
  { id: 'pato',      label: 'Pato' },
  { id: 'garza',     label: 'Garza o ibis' },
  { id: 'gallineta', label: 'Gallineta de pantano' },
  { id: 'buceador',  label: 'Buceador' },
  { id: 'playera',   label: 'Playera de orilla' },
  { id: 'rapaz',     label: 'Rapaz o zopilote' },
  { id: 'pajaro',    label: 'Pájaro pequeño' },
];

const SIZES = [
  { id: 'muy-chica',  label: 'Muy chica',  hint: 'como un colibrí' },
  { id: 'chica',      label: 'Chica',      hint: 'como un gorrión' },
  { id: 'mediana',    label: 'Mediana',    hint: 'como una paloma' },
  { id: 'grande',     label: 'Grande',     hint: 'como una gallina' },
  { id: 'muy-grande', label: 'Muy grande', hint: 'más que una garza' },
];

const COLORS = [
  { id: 'blanco',      label: 'Blanco',         hex: '#ffffff', ring: true },
  { id: 'negro',       label: 'Negro',          hex: '#23302a' },
  { id: 'cafe',        label: 'Café/marrón',    hex: '#7a5631' },
  { id: 'gris',        label: 'Gris',           hex: '#9aa3a0' },
  { id: 'azul',        label: 'Azul',           hex: '#3f6f9e' },
  { id: 'verde',       label: 'Verde',          hex: '#5a8a3c' },
  { id: 'amarillo',    label: 'Amarillo',       hex: '#e0b020' },
  { id: 'rojo',        label: 'Rojo o rosa',    hex: '#b5543a' },
  { id: 'naranja',     label: 'Naranja/canela', hex: '#c8803c' },
  { id: 'iridiscente', label: 'Iridiscente',    gradient: 'linear-gradient(135deg,#2f8d77,#3f6f9e 45%,#6a4d86)' },
];

const WHERES = [
  { id: 'nadando', label: 'Nadando en el agua',        icon: 'waves' },
  { id: 'orilla',  label: 'Caminando en la orilla o lodo', icon: 'pin' },
  { id: 'volando', label: 'Volando alto',              icon: 'cloud' },
  { id: 'arbol',   label: 'Posada en árbol o arbusto', icon: 'trees' },
  { id: 'suelo',   label: 'En el suelo o pastizal',    icon: 'sprout' },
  { id: 'poste',   label: 'Sobre poste o rama seca',   icon: 'post' },
];

/* ---- selecciones rápidas (cada una aplica varios filtros) ---- */
const QUICKS = [
  { id: 'comunes',    icon: 'flame',  title: 'Las más comunes',        desc: 'Fáciles de avistar',                    patch: { observaciones: ['Común'] } },
  { id: 'dificiles',  icon: 'eye',    title: 'Difíciles de ver',       desc: 'Raras o poco comunes',                  patch: { observaciones: ['Raro', 'Poco Común'] } },
  { id: 'migratorias',icon: 'plane',  title: 'Migratorias de invierno',desc: 'Visitan en temporada fría',             patch: { presencias: ['Migratoria'] } },
  { id: 'residentes', icon: 'house',  title: 'Residentes todo el año', desc: 'Siempre en la laguna',                  patch: { presencias: ['Residente'] } },
  { id: 'nom059',     icon: 'shield', title: 'Bajo protección NOM-059',desc: 'Especies protegidas',                   patch: { conservaciones: ['NOM-059'] } },
  { id: 'agua',       icon: 'droplet',title: 'Aves del agua',          desc: 'Vadeadoras, nadadoras y playeras',      patch: { categorias: ['vadeadoras', 'nadadoras', 'playeras'] } },
  { id: 'tierra',     icon: 'trees',  title: 'Aves de tierra y árboles',desc: 'Terrestres y voladoras',               patch: { categorias: ['terrestres', 'voladoras'] } },
  { id: 'rapaces',    icon: 'raptor', title: 'Rapaces y carroñeras',   desc: 'Depredadoras del cielo',                patch: { categorias: ['rapaces'] } },
  { id: 'destacadas', icon: 'star',   title: 'Destacadas del autor',   desc: 'Selección del Dr. Roldán',              patch: { featured: true } },
];

/* ---- 9 aves de muestra ---- */
const BIRDS = [
  {
    id: 'garza-blanca', common: 'Garza Blanca', sci: 'Ardea alba',
    category: 'vadeadoras', shape: 'garza', size: 'grande', colors: ['blanco'], where: 'orilla',
    presence: 'Residente', observation: 'Común', conservation: 'Sin Amenaza', featured: true,
    orden: 'Pelecaniformes', familia: 'Ardeidae',
    img: null, href: '#',
    desc: 'Garza grande y esbelta de plumaje completamente blanco, pico amarillo y patas negras; pesca paciente en las orillas.',
    keywords: 'garza blanca grande ardea alba vadeadora orilla blanca',
  },
  {
    id: 'pijije', common: 'Pijije Alas Blancas', sci: 'Dendrocygna autumnalis',
    category: 'nadadoras', shape: 'pato', size: 'mediana', colors: ['cafe', 'naranja'], where: 'nadando',
    presence: 'Residente', observation: 'Común', conservation: null, featured: false,
    orden: 'Anseriformes', familia: 'Anatidae',
    img: null, href: '#',
    desc: 'Pato arborícola de patas largas y silbido agudo; forma bandadas ruidosas en orillas y campos inundados.',
    keywords: 'pijije pato dendrocygna anatidae nadadora cafe canela silbador',
  },
  {
    id: 'avetoro', common: 'Avetoro Norteño', sci: 'Botaurus lentiginosus',
    category: 'vadeadoras', shape: 'garza', size: 'mediana', colors: ['cafe'], where: 'suelo',
    presence: 'Migratoria', observation: 'Raro', conservation: 'NOM-059', featured: true,
    orden: 'Pelecaniformes', familia: 'Ardeidae',
    img: 'assets/avetoro.png', href: 'index.html',
    desc: 'Garza críptica y solitaria que se mimetiza entre las cañas con el cuello extendido hacia arriba.',
    keywords: 'avetoro botaurus garza vadeadora cafe pastizal migratoria raro nom059',
  },
  {
    id: 'martin-pescador', common: 'Martín Pescador Norteño', sci: 'Megaceryle alcyon',
    category: 'voladoras', shape: 'pajaro', size: 'mediana', colors: ['azul', 'blanco'], where: 'poste',
    presence: 'Migratoria', observation: 'Raro', conservation: null, featured: false,
    orden: 'Coraciiformes', familia: 'Alcedinidae',
    img: null, href: '#',
    desc: 'Ave robusta de cabeza grande y cresta; se lanza en picada al agua desde una percha para atrapar peces.',
    keywords: 'martin pescador megaceryle azul cresta voladora rama migratoria',
  },
  {
    id: 'zopilote', common: 'Zopilote Aura', sci: 'Cathartes aura',
    category: 'rapaces', shape: 'rapaz', size: 'grande', colors: ['negro'], where: 'volando',
    presence: 'Residente', observation: 'Poco Común', conservation: null, featured: false,
    orden: 'Cathartiformes', familia: 'Cathartidae',
    img: null, href: '#',
    desc: 'Carroñero de vuelo cadencioso en "V"; planea durante horas oliendo el aire en busca de alimento.',
    keywords: 'zopilote aura cathartes rapaz carroñera negra volando planea',
  },
  {
    id: 'colibri', common: 'Colibrí Berilo', sci: 'Saucerottia beryllina',
    category: 'terrestres', shape: 'pajaro', size: 'muy-chica', colors: ['iridiscente', 'verde'], where: 'arbol',
    presence: 'Residente', observation: 'Poco Común', conservation: null, featured: true,
    orden: 'Apodiformes', familia: 'Trochilidae',
    img: null, href: '#',
    desc: 'Colibrí diminuto de verdes iridiscentes y vientre canela; defiende con energía las flores de su territorio.',
    keywords: 'colibri berilo saucerottia trochilidae iridiscente verde arbusto muy chica',
  },
  {
    id: 'gallareta', common: 'Gallareta Americana', sci: 'Fulica americana',
    category: 'nadadoras', shape: 'gallineta', size: 'mediana', colors: ['negro', 'blanco'], where: 'nadando',
    presence: 'Residente', observation: 'Común', conservation: null, featured: false,
    orden: 'Gruiformes', familia: 'Rallidae',
    img: null, href: '#',
    desc: 'Ave acuática negra con escudo y pico blancos; nada batiendo la cabeza y corre sobre el agua al despegar.',
    keywords: 'gallareta americana fulica rallidae negra escudo blanco nadadora gallineta',
  },
  {
    id: 'luis', common: 'Luis Bienteveo', sci: 'Pitangus sulphuratus',
    category: 'voladoras', shape: 'pajaro', size: 'mediana', colors: ['amarillo', 'cafe'], where: 'poste',
    presence: 'Residente', observation: 'Común', conservation: null, featured: false,
    orden: 'Passeriformes', familia: 'Tyrannidae',
    img: null, href: '#',
    desc: 'Atrapamoscas grande de pecho amarillo y antifaz negro; su canto "bien-te-veo" es inconfundible.',
    keywords: 'luis bienteveo pitangus tyrannidae amarillo poste voladora comun',
  },
  {
    id: 'zambullidor', common: 'Zambullidor Menor', sci: 'Tachybaptus dominicus',
    category: 'nadadoras', shape: 'buceador', size: 'chica', colors: ['cafe'], where: 'nadando',
    presence: 'Residente', observation: 'Común', conservation: 'NOM-059', featured: false,
    orden: 'Podicipediformes', familia: 'Podicipedidae',
    img: null, href: '#',
    desc: 'El zambullidor más pequeño; se sumerge largo rato y desaparece bajo el agua ante el peligro.',
    keywords: 'zambullidor menor tachybaptus podicipedidae buceador cafe nadadora nom059',
  },
];

window.SEARCH_DATA = { CATS, PRESENCE, OBSERVATION, SHAPES, SIZES, COLORS, WHERES, QUICKS, BIRDS };
