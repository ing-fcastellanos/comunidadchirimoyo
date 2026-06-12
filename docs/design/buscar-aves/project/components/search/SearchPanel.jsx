/* global React, window */
/* SearchPanel.jsx — acordeón con dos secciones mutuamente excluyentes:
   2A Búsqueda detallada · 2B Selecciones rápidas */
const { useState, useRef } = React;
const { Ico, ShapeIcon } = window;

/* ---------- primitivos ---------- */

function Chip({ active, onClick, className = "", children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group/chip flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[14px] font-600 ring-1 ring-inset transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
        active
          ? 'bg-forest text-paper ring-forest shadow-soft'
          : 'bg-paper-card text-ink ring-forest/15 hover:bg-mint-wash hover:ring-forest/30'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function BlockLabel({ children }) {
  return <h4 className="mb-3 text-[12px] font-700 uppercase tracking-[0.18em] text-forest/70">{children}</h4>;
}

/* ---------- 2A · Búsqueda detallada ---------- */

function Autocomplete({ filters, setText, data }) {
  const [focused, setFocused] = useState(false);
  const blurT = useRef(null);
  const q = filters.text.trim().toLowerCase();
  const sugg = q
    ? data.BIRDS.filter((b) => (b.common + ' ' + b.sci + ' ' + b.familia + ' ' + b.keywords).toLowerCase().includes(q)).slice(0, 6)
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest"><Ico name="search" className="h-5 w-5" /></span>
        <input
          type="text"
          value={filters.text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { blurT.current = setTimeout(() => setFocused(false), 150); }}
          placeholder="Buscar por nombre, familia o palabra clave..."
          aria-label="Buscar aves"
          className="w-full rounded-2xl border-0 bg-paper-card py-4 pl-12 pr-11 text-[16px] text-ink shadow-soft ring-1 ring-inset ring-forest/15 transition-shadow placeholder:text-ink-soft/55 focus:outline-none focus:ring-2 focus:ring-forest"
        />
        {filters.text && (
          <button type="button" onClick={() => setText('')} aria-label="Borrar búsqueda" className="absolute right-3.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep">
            <Ico name="x" className="h-4 w-4" />
          </button>
        )}
      </div>

      {focused && sugg.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/12" role="listbox">
          {sugg.map((b) => {
            const cat = data.CATS[b.category];
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); clearTimeout(blurT.current); setText(b.common); setFocused(false); }}
                  className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-mint-wash"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-paper-deep ring-1 ring-forest/10">
                    {b.img ? <img src={b.img} alt="" className="h-full w-full object-cover" /> : <Ico name="feather" className="h-4 w-4 text-forest-deep/50" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-600 text-forest-deep">{b.common}</span>
                    <span className="block truncate font-serif text-[13px] italic text-ink-soft/75">{b.sci}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-700 uppercase tracking-[0.06em] ring-1 ring-inset ${cat.chip}`}>{cat.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AdvancedFilters({ filters, setOne, data }) {
  const [open, setOpen] = useState(false);
  const ordenes = [...new Set(data.BIRDS.map((b) => b.orden))].sort();
  const familias = [...new Set(data.BIRDS.map((b) => b.familia))].sort();
  const selects = [
    { key: 'categorias', label: 'Categoría', options: Object.keys(data.CATS).map((k) => [k, data.CATS[k].label]) },
    { key: 'ordenes', label: 'Orden', options: ordenes.map((o) => [o, o]) },
    { key: 'familias', label: 'Familia', options: familias.map((f) => [f, f]) },
    { key: 'presencias', label: 'Presencia', options: [['Residente', 'Residente'], ['Migratoria', 'Migratoria'], ['Invasora', 'Invasora']] },
    { key: 'conservaciones', label: 'Estado de conservación', options: [['NOM-059', 'Protección NOM-059'], ['Sin Amenaza', 'Sin amenaza']] },
  ];

  return (
    <div className="rounded-2xl bg-mint-wash/50 ring-1 ring-forest/10">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left">
        <span className="flex items-center gap-2 text-[14px] font-700 text-forest-deep"><Ico name="filter" className="h-4 w-4" /> Filtros avanzados</span>
        <Ico name="chevron-down" className={`h-4 w-4 text-forest transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
          {selects.map((s) => (
            <label key={s.key} className="block">
              <span className="mb-1.5 block text-[12px] font-700 uppercase tracking-[0.12em] text-forest/70">{s.label}</span>
              <div className="relative">
                <select
                  value={filters[s.key][0] || ''}
                  onChange={(e) => setOne(s.key, e.target.value)}
                  className="w-full appearance-none rounded-xl bg-paper-card py-2.5 pl-3.5 pr-9 text-[14px] text-ink ring-1 ring-inset ring-forest/15 focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="">Cualquiera</option>
                  {s.options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-forest"><Ico name="chevron-down" className="h-4 w-4" /></span>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailedSearch({ filters, setText, toggleVal, setOne, count, clearAll, data }) {
  return (
    <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-8">
      <Autocomplete filters={filters} setText={setText} data={data} />

      {/* Por forma */}
      <div>
        <BlockLabel>Por forma</BlockLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.SHAPES.map((s) => {
            const active = filters.shapes.includes(s.id);
            return (
              <Chip key={s.id} active={active} onClick={() => toggleVal('shapes', s.id)} className="!flex-col !items-center !gap-2 !py-4 text-center">
                <ShapeIcon name={s.id} className={`h-8 w-12 ${active ? 'text-paper' : 'text-forest'}`} />
                <span className="text-[13px] leading-tight">{s.label}</span>
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Tamaño */}
      <div>
        <BlockLabel>Tamaño</BlockLabel>
        <div className="flex flex-wrap gap-2.5">
          {data.SIZES.map((s) => {
            const active = filters.sizes.includes(s.id);
            return (
              <Chip key={s.id} active={active} onClick={() => toggleVal('sizes', s.id)}>
                <span>{s.label}</span>
                <span className={`text-[12px] font-400 ${active ? 'text-paper/75' : 'text-ink-soft/65'}`}>· {s.hint}</span>
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Color predominante */}
      <div>
        <BlockLabel>Color predominante</BlockLabel>
        <div className="flex flex-wrap gap-2.5">
          {data.COLORS.map((c) => {
            const active = filters.colors.includes(c.id);
            return (
              <Chip key={c.id} active={active} onClick={() => toggleVal('colors', c.id)} className="!px-3">
                <span className={`h-4 w-4 rounded-full ${c.ring ? 'ring-1 ring-inset ring-forest/30' : ''} ${active ? 'outline outline-2 outline-offset-1 outline-paper/40' : ''}`} style={{ background: c.gradient || c.hex }}></span>
                <span>{c.label}</span>
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Dónde la viste */}
      <div>
        <BlockLabel>Dónde la viste</BlockLabel>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {data.WHERES.map((w) => {
            const active = filters.wheres.includes(w.id);
            return (
              <Chip key={w.id} active={active} onClick={() => toggleVal('wheres', w.id)} className="!justify-start">
                <Ico name={w.icon} className={`h-5 w-5 shrink-0 ${active ? 'text-paper' : 'text-forest'}`} />
                <span className="text-left text-[14px] leading-tight">{w.label}</span>
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Avanzados */}
      <AdvancedFilters filters={filters} setOne={setOne} data={data} />

      {/* footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forest/10 pt-5">
        <span className="text-[15px] text-ink/80"><strong className="font-700 text-forest-deep">{count}</strong> {count === 1 ? 'ave coincide' : 'aves coinciden'}</span>
        <button type="button" onClick={clearAll} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[14px] font-600 text-forest ring-1 ring-inset ring-forest/20 transition-colors hover:bg-mint-wash">
          <Ico name="x" className="h-4 w-4" /> Limpiar filtros
        </button>
      </div>
    </div>
  );
}

/* ---------- 2B · Selecciones rápidas ---------- */

function QuickSelections({ applyQuick, data }) {
  return (
    <div className="px-5 py-7 sm:px-8 sm:py-8">
      <p className="mb-5 text-[15px] leading-relaxed text-ink/75">Toca una tarjeta para aplicar varios filtros de golpe; verás los resultados en la búsqueda detallada.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.QUICKS.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => applyQuick(q.patch)}
            className="group flex items-start gap-4 rounded-2xl bg-paper-card p-5 text-left shadow-soft ring-1 ring-forest/[0.09] transition-all duration-200 hover:-translate-y-0.5 hover:ring-forest/30 hover:shadow-card"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint-wash text-forest-deep transition-colors group-hover:bg-mint-soft">
              <Ico name={q.icon} className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-[20px] font-600 leading-tight text-forest-deep">{q.title}</span>
              <span className="mt-0.5 block text-[14px] leading-snug text-ink/70">{q.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- acordeón ---------- */

function AccordionSection({ title, subtitle, open, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.08]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 border-b-2 border-gold bg-paper-deep px-5 py-4 text-left transition-colors hover:bg-mint-wash sm:px-8"
        style={{ borderBottomColor: '#c89b3c' }}
      >
        <span className="flex min-w-0 flex-col text-left">
          <span className="block font-serif text-[26px] font-600 leading-[1.1] text-forest-deep">{title}</span>
          <span className="block text-[13px] text-ink/65">{subtitle}</span>
        </span>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper-card text-forest ring-1 ring-forest/15 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <Ico name="chevron-down" className="h-5 w-5" />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

function SearchPanel(props) {
  const { openSection, setOpenSection } = props;
  return (
    <div className="space-y-4">
      <AccordionSection
        title="Búsqueda detallada"
        subtitle="Combina nombre, forma, tamaño, color y hábitat"
        open={openSection === 'detailed'}
        onToggle={() => setOpenSection(openSection === 'detailed' ? null : 'detailed')}
      >
        <DetailedSearch {...props} />
      </AccordionSection>

      <AccordionSection
        title="Selecciones rápidas"
        subtitle="Atajos que aplican varios filtros a la vez"
        open={openSection === 'quick'}
        onToggle={() => setOpenSection(openSection === 'quick' ? null : 'quick')}
      >
        <QuickSelections applyQuick={props.applyQuick} data={props.data} />
      </AccordionSection>
    </div>
  );
}

window.SearchPanel = SearchPanel;
