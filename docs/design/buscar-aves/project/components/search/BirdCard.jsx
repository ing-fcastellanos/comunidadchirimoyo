/* global React, window */
/* BirdCard.jsx — tarjeta de resultado de ave (vista grid y lista) */
const { Ico } = window;

/* tooltip ligero por hover */
function Trait({ label, children }) {
  return (
    <div className="group/t relative flex items-center">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-pine-deep px-2.5 py-1 text-[11px] font-500 text-paper opacity-0 shadow-card transition-opacity duration-150 group-hover/t:opacity-100">
        {label}
      </span>
    </div>
  );
}

function CategoryChip({ cat, CATS }) {
  const meta = CATS[cat];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-700 uppercase tracking-[0.08em] ring-1 ring-inset backdrop-blur-sm ${meta.chip}`}>
      {meta.label}
    </span>
  );
}

function Pills({ bird, data }) {
  const pres = data.PRESENCE[bird.presence];
  const obs = data.OBSERVATION[bird.observation];
  const protect = bird.conservation === 'NOM-059';
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-full bg-paper-deep px-2.5 py-1 text-[12px] font-600 text-ink-soft">
        <Ico name={pres.icon} className="h-3.5 w-3.5" sw={2.2} /> {pres.label}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-deep px-2.5 py-1 text-[12px] font-600 text-ink-soft">
        <span className="h-2 w-2 rounded-full" style={{ background: obs.dot }}></span> {obs.label}
      </span>
      {protect && (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#f6e1da] px-2.5 py-1 text-[12px] font-600 text-[#8f3c25]">
          <Ico name="shield" className="h-3.5 w-3.5" sw={2.2} /> NOM-059
        </span>
      )}
    </div>
  );
}

function TraitRow({ bird, data }) {
  const size = data.SIZES.find((s) => s.id === bird.size);
  const where = data.WHERES.find((w) => w.id === bird.where);
  const colorMetas = bird.colors.map((c) => data.COLORS.find((x) => x.id === c)).filter(Boolean);
  return (
    <div className="flex items-center gap-4 border-t border-forest/[0.08] pt-3 text-forest-soft">
      <Trait label={`Tamaño: ${size.label} (${size.hint})`}>
        <span className="flex items-center gap-1.5 text-[12px] font-600 text-ink-soft">
          <Ico name="ruler" className="h-4 w-4 text-forest" /> {size.label}
        </span>
      </Trait>
      <Trait label={`Color: ${colorMetas.map((c) => c.label).join(', ')}`}>
        <span className="flex items-center gap-1">
          {colorMetas.map((c) => (
            <span key={c.id} className={`h-3.5 w-3.5 rounded-full ${c.ring ? 'ring-1 ring-inset ring-forest/25' : ''}`} style={{ background: c.gradient || c.hex }}></span>
          ))}
        </span>
      </Trait>
      <Trait label={`Dónde: ${where.label}`}>
        <span className="flex items-center gap-1.5 text-[12px] font-600 text-ink-soft">
          <Ico name={where.icon} className="h-4 w-4 text-forest" />
        </span>
      </Trait>
    </div>
  );
}

function Figure({ bird, ratioClass }) {
  return (
    <figure className={`relative overflow-hidden bg-paper-deep ${ratioClass}`}>
      {bird.img ? (
        <img src={bird.img} alt={`${bird.common} (${bird.sci})`} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
      ) : (
        <div className="placeholder-stripes flex h-full w-full flex-col items-center justify-center gap-2 text-forest-deep/45 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
          <Ico name="feather" className="h-7 w-7" />
          <span className="px-3 text-center font-mono text-[12px] leading-tight">Foto: {bird.common}</span>
        </div>
      )}
    </figure>
  );
}

function VerFicha({ href }) {
  return (
    <a href={href} className="mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-forest px-4 py-2.5 text-[14px] font-600 text-paper transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25">
      Ver ficha completa <Ico name="arrow-right" className="h-4 w-4" />
    </a>
  );
}

function BirdCard({ bird, view, data }) {
  if (view === 'list') {
    return (
      <article className="group flex flex-col overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.07] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(7,61,36,.06),0_14px_34px_-14px_rgba(7,61,36,.3)] sm:flex-row">
        <div className="relative sm:w-[230px] sm:shrink-0">
          <Figure bird={bird} ratioClass="aspect-[4/3] sm:h-full sm:aspect-auto" />
          <div className="absolute right-2.5 top-2.5"><CategoryChip cat={bird.category} CATS={data.CATS} /></div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex-1">
            <h3 className="font-serif text-[24px] font-600 leading-tight text-forest-deep">{bird.common}</h3>
            <p className="mb-2.5 font-serif text-[16px] italic text-ink-soft/80">{bird.sci}</p>
            <Pills bird={bird} data={data} />
            <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-ink/75">{bird.desc}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <TraitRow bird={bird} data={data} />
            <a href={bird.href} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-forest px-4 py-2.5 text-[14px] font-600 text-paper transition-colors hover:bg-forest-deep">
              Ver ficha <Ico name="arrow-right" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-paper-card shadow-card ring-1 ring-forest/[0.07] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(7,61,36,.06),0_18px_40px_-16px_rgba(7,61,36,.32)]">
      <div className="relative">
        <Figure bird={bird} ratioClass="aspect-[4/3]" />
        <div className="absolute right-3 top-3"><CategoryChip cat={bird.category} CATS={data.CATS} /></div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-[24px] font-600 leading-tight text-forest-deep">{bird.common}</h3>
        <p className="mb-2.5 font-serif text-[16px] italic text-ink-soft/80">{bird.sci}</p>
        <Pills bird={bird} data={data} />
        <p className="mt-2.5 line-clamp-2 min-h-[2.6em] text-[14px] leading-relaxed text-ink/75">{bird.desc}</p>
        <div className="mt-3"><TraitRow bird={bird} data={data} /></div>
        <VerFicha href={bird.href} />
      </div>
    </article>
  );
}

window.BirdCard = BirdCard;
