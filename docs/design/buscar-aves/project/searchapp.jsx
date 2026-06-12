/* global React, ReactDOM, window */
/* searchapp.jsx — orquestador de la búsqueda de aves del Chirimoyo */
const { useState, useMemo } = React;
const { Ico, BirdCard, SearchPanel } = window;
const DATA = window.SEARCH_DATA;

const EMPTY = {
  text: '', shapes: [], sizes: [], colors: [], wheres: [],
  categorias: [], ordenes: [], familias: [], presencias: [], observaciones: [], conservaciones: [],
  featured: false,
};

const OBS_ORDER = { 'Común': 0, 'Poco Común': 1, 'Raro': 2 };

/* ---------- helpers de etiqueta para las pills ---------- */
function labelFor(key, val) {
  const d = DATA;
  switch (key) {
    case 'shapes': return d.SHAPES.find((s) => s.id === val)?.label;
    case 'sizes': return d.SIZES.find((s) => s.id === val)?.label;
    case 'colors': return d.COLORS.find((s) => s.id === val)?.label;
    case 'wheres': return d.WHERES.find((s) => s.id === val)?.label;
    case 'categorias': return d.CATS[val]?.label;
    case 'conservaciones': return val === 'NOM-059' ? 'Protección NOM-059' : val;
    default: return val;
  }
}
const GROUP_NAME = {
  shapes: 'Forma', sizes: 'Tamaño', colors: 'Color', wheres: 'Hábitat',
  categorias: 'Categoría', ordenes: 'Orden', familias: 'Familia',
  presencias: 'Presencia', observaciones: 'Observación', conservaciones: 'Conservación',
};

/* ---------- cabecera compacta ---------- */
function Header({ found }) {
  return (
    <header className="border-b border-forest/10 bg-paper-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="assets/logo-chirimoyo.jpeg" alt="Logotipo de la Comunidad del Chirimoyo" className="h-12 w-12 rounded-full object-cover ring-1 ring-forest/15" />
          <div className="min-w-0 leading-tight">
            <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-600 leading-[1.08] text-forest-deep">Guía de Aves de la Laguna del Chirimoyo</h1>
            <p className="mt-1 text-[13px] text-ink/70">Busca entre <strong className="font-600 text-forest">46 especies</strong> registradas en la laguna</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <a href="pages/index.html" className="hidden rounded-full bg-mint-wash px-4 py-2 text-[13px] font-600 text-forest-deep ring-1 ring-forest/15 transition-colors hover:bg-mint-soft sm:inline-flex">Componentes</a>
          <a href="index.html" className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[13px] font-600 text-paper transition-colors hover:bg-forest-deep">
            <Ico name="feather" className="h-4 w-4" /> Ficha destacada
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ---------- barra de control de resultados (sticky) ---------- */
function ResultsBar({ found, sort, setSort, view, setView }) {
  return (
    <div className="sticky top-0 z-20 -mx-6 border-y border-forest/10 bg-paper/85 px-6 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[16px] font-600 text-forest-deep">{found} {found === 1 ? 'ave encontrada' : 'aves encontradas'}</span>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar resultados" className="appearance-none rounded-xl bg-paper-card py-2 pl-3.5 pr-9 text-[13px] font-600 text-ink ring-1 ring-inset ring-forest/15 focus:outline-none focus:ring-2 focus:ring-forest">
              <option value="relevancia">Relevancia</option>
              <option value="alfabetico">Alfabético</option>
              <option value="categoria">Por categoría</option>
              <option value="comun-rara">De más común a más rara</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-forest"><Ico name="chevron-down" className="h-4 w-4" /></span>
          </div>
          <div className="flex rounded-xl bg-paper-card p-1 ring-1 ring-inset ring-forest/15">
            {[['grid', 'grid'], ['list', 'list']].map(([v, icon]) => (
              <button key={v} type="button" onClick={() => setView(v)} aria-label={v === 'grid' ? 'Vista de cuadrícula' : 'Vista de lista'} aria-pressed={view === v}
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${view === v ? 'bg-forest text-paper' : 'text-forest hover:bg-mint-wash'}`}>
                <Ico name={icon} className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- pills de filtros activos ---------- */
function ActivePills({ filters, toggleVal, setText, setFilters, clearAll }) {
  const pills = [];
  if (filters.text.trim()) pills.push({ k: 'text', label: `"${filters.text.trim()}"`, remove: () => setText('') });
  ['shapes', 'sizes', 'colors', 'wheres', 'categorias', 'ordenes', 'familias', 'presencias', 'observaciones', 'conservaciones'].forEach((key) => {
    filters[key].forEach((val) => pills.push({ k: key + val, group: GROUP_NAME[key], label: labelFor(key, val), remove: () => toggleVal(key, val) }));
  });
  if (filters.featured) pills.push({ k: 'featured', label: 'Destacadas del autor', remove: () => setFilters((f) => ({ ...f, featured: false })) });

  if (!pills.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 py-5">
      <span className="text-[13px] font-700 uppercase tracking-[0.12em] text-forest/60">Filtros activos</span>
      {pills.map((p) => (
        <button key={p.k} type="button" onClick={p.remove} className="group inline-flex items-center gap-1.5 rounded-full bg-mint-soft py-1.5 pl-3 pr-2 text-[13px] font-600 text-forest-deep ring-1 ring-inset ring-forest/15 transition-colors hover:bg-mint">
          {p.group && <span className="text-forest/55">{p.group}:</span>} {p.label}
          <span className="grid h-4 w-4 place-items-center rounded-full bg-forest/15 transition-colors group-hover:bg-forest/30"><Ico name="x" className="h-3 w-3" sw={2.5} /></span>
        </button>
      ))}
      <button type="button" onClick={clearAll} className="ml-1 text-[13px] font-600 text-forest underline-offset-2 hover:underline">Limpiar todo</button>
    </div>
  );
}

/* ---------- estado vacío ---------- */
function EmptyState({ clearAll }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-paper-card px-6 py-20 text-center shadow-card ring-1 ring-forest/[0.07]">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-mint-wash text-forest-deep/70"><Ico name="binoculars" className="h-10 w-10" sw={1.7} /></span>
      <h3 className="mt-5 font-serif text-[26px] font-600 leading-[1.15] text-forest-deep">No encontramos aves con esos rasgos</h3>
      <p className="mt-2 max-w-sm text-[16px] leading-relaxed text-ink/70">Prueba quitando un filtro o ampliando el color y el tamaño.</p>
      <button type="button" onClick={clearAll} className="mt-6 inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-forest px-5 py-2.5 text-[14px] font-600 text-paper transition-colors hover:bg-forest-deep">
        <Ico name="x" className="h-4 w-4" /> Limpiar filtros
      </button>
    </div>
  );
}

/* ---------- app ---------- */
function BuscarAves() {
  const [filters, setFilters] = useState(EMPTY);
  const [openSection, setOpenSection] = useState('detailed');
  const [sort, setSort] = useState('relevancia');
  const [view, setView] = useState('grid');

  const setText = (v) => setFilters((f) => ({ ...f, text: v }));
  const toggleVal = (key, val) => setFilters((f) => {
    const arr = f[key];
    return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
  });
  const setOne = (key, val) => setFilters((f) => ({ ...f, [key]: val ? [val] : [] }));
  const clearAll = () => setFilters(EMPTY);
  const applyQuick = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setOpenSection('detailed');
  };

  const results = useMemo(() => {
    const f = filters;
    const q = f.text.trim().toLowerCase();
    const arrOk = (arr, val) => arr.length === 0 || arr.includes(val);
    let list = DATA.BIRDS.filter((b) => {
      if (q && !(b.common + ' ' + b.sci + ' ' + b.familia + ' ' + b.orden + ' ' + b.keywords).toLowerCase().includes(q)) return false;
      if (!arrOk(f.shapes, b.shape)) return false;
      if (!arrOk(f.sizes, b.size)) return false;
      if (f.colors.length && !f.colors.some((c) => b.colors.includes(c))) return false;
      if (!arrOk(f.wheres, b.where)) return false;
      if (!arrOk(f.categorias, b.category)) return false;
      if (!arrOk(f.ordenes, b.orden)) return false;
      if (!arrOk(f.familias, b.familia)) return false;
      if (!arrOk(f.presencias, b.presence)) return false;
      if (!arrOk(f.observaciones, b.observation)) return false;
      if (!arrOk(f.conservaciones, b.conservation)) return false;
      if (f.featured && !b.featured) return false;
      return true;
    });
    const by = {
      alfabetico: (a, b) => a.common.localeCompare(b.common, 'es'),
      categoria: (a, b) => DATA.CATS[a.category].label.localeCompare(DATA.CATS[b.category].label, 'es') || a.common.localeCompare(b.common, 'es'),
      'comun-rara': (a, b) => OBS_ORDER[a.observation] - OBS_ORDER[b.observation] || a.common.localeCompare(b.common, 'es'),
    };
    if (by[sort]) list = [...list].sort(by[sort]);
    return list;
  }, [filters, sort]);

  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <Header found={results.length} />

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <div className="py-7 sm:py-9">
          <SearchPanel
            filters={filters} setText={setText} toggleVal={toggleVal} setOne={setOne}
            count={results.length} clearAll={clearAll} applyQuick={applyQuick}
            openSection={openSection} setOpenSection={setOpenSection} data={DATA}
          />
        </div>

        <ResultsBar found={results.length} sort={sort} setSort={setSort} view={view} setView={setView} />

        <ActivePills filters={filters} toggleVal={toggleVal} setText={setText} setFilters={setFilters} clearAll={clearAll} />

        {results.length === 0 ? (
          <EmptyState clearAll={clearAll} />
        ) : (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'}>
            {results.map((b) => <BirdCard key={b.id} bird={b} view={view} data={DATA} />)}
          </div>
        )}
      </main>

      <footer className="border-t border-forest/10 bg-paper-deep">
        <div className="mx-auto max-w-6xl px-6 py-8 text-[13px] text-ink-soft/70">
          Guía de Aves – Laguna del Chirimoyo, Orizaba, Veracruz, México · Dr. Eduardo Roldán Reyes, 2025.
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<BuscarAves />);
