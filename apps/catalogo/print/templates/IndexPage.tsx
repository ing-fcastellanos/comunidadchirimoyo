/* IndexPage.tsx — Índice de especies (una o varias hojas A4). El reparto en
   columnas y páginas lo decide el orquestador; aquí solo se pinta una página.
   Portado de print/IndexPage.jsx. */
import React from "react";
import { Kicker } from "./shared";
import type { IndexPageVM, IndexItem, CatalogMeta } from "./types";

const GuildHead = ({ it }: { it: Extract<IndexItem, { kind: "guild" }> }) => (
  <div className="break-inside-avoid mt-7 first:mt-0">
    <div className="mb-1.5 flex items-center gap-3">
      <h3 className="font-serif text-[23px] font-600 leading-none text-forest-deep">{it.key}</h3>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-wash px-2.5 py-[3px] text-[11px] font-600 text-forest-deep ring-1 ring-forest/12">
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: it.dot }}></span>
        {it.count} <span className="font-400 text-ink-soft/70">esp.</span>
      </span>
    </div>
    <div className="mb-1 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, #15824c, #8ed8c0 80%, transparent)" }}></div>
  </div>
);

const Row = ({ it }: { it: Extract<IndexItem, { kind: "row" }> }) => (
  <div className="flex items-baseline gap-2 py-[5.5px]">
    <span className="text-[14px] font-500 text-ink">{it.name}</span>
    <span className="font-serif italic text-[13px] text-ink-soft/80">{it.sci}</span>
    <span className="mx-1 flex-1 translate-y-[-3px] border-b border-dotted border-forest/35"></span>
    <span className="text-[13px] font-600 tabular-nums text-forest-deep">{String(it.pg).padStart(2, "0")}</span>
  </div>
);

const Column = ({ items }: { items: IndexItem[] }) => (
  <div>
    {items.map((it, i) =>
      it.kind === "guild" ? <GuildHead key={`g${i}`} it={it} /> : <Row key={`r${i}`} it={it} />
    )}
  </div>
);

export const IndexPage = ({ page, total, meta }: { page: IndexPageVM; total: number; meta: CatalogMeta }) => (
  <article className="a4 relative bg-paper text-ink">
    {page.showHeader ? (
      <header className="px-[16mm] pt-[15mm] pb-[7mm]">
        <div className="flex items-end justify-between">
          <div>
            <Kicker>Cómo navegar la guía</Kicker>
            <h2 className="mt-3 font-serif text-[48px] font-500 leading-none text-forest-deep">Índice de especies</h2>
            <p className="mt-3 text-[15px] text-ink-soft">{total} {meta.indiceSubtitulo}</p>
          </div>
          <div className="flex shrink-0 items-stretch gap-5 text-right">
            <div className="leading-none">
              <div className="font-serif text-[40px] font-600 text-forest-deep">{total}</div>
              <div className="mt-1 text-[10px] font-700 uppercase tracking-[.16em] text-forest/80">especies</div>
            </div>
            <div className="w-px bg-forest/15"></div>
            <div className="leading-none">
              <div className="font-serif text-[40px] font-600 text-forest-deep">{page.totalGuilds}</div>
              <div className="mt-1 text-[10px] font-700 uppercase tracking-[.16em] text-forest/80">{meta.categoriaPlural}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 h-[3px] rounded-full" style={{ background: "linear-gradient(90deg, #073d24, #15824c 35%, #8ed8c0 75%, #cdeedd)" }}></div>
      </header>
    ) : (
      <header className="px-[16mm] pt-[15mm] pb-[5mm]">
        <Kicker>Índice de especies · continúa</Kicker>
        <div className="mt-3 h-[3px] rounded-full" style={{ background: "linear-gradient(90deg, #073d24, #15824c 35%, #8ed8c0 75%, #cdeedd)" }}></div>
      </header>
    )}

    <div className="grid grid-cols-2 gap-x-12 px-[16mm] pt-[6mm]">
      <Column items={page.columns[0]} />
      <Column items={page.columns[1]} />
    </div>

    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-[16mm] pb-[9mm] text-[10px] text-ink-soft/75">
      <span className="font-600 uppercase tracking-[.2em]">Catálogo de aves · Chirimoyo</span>
      <span className="uppercase tracking-[.18em]">Índice de especies</span>
    </div>
  </article>
);
