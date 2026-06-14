/* Cover.tsx — Portada a sangre completa. Portado de print/Cover.jsx. */
import React from "react";
import { Wordmark, Photo, Kicker, Icon } from "./shared";
import type { CatalogData } from "./types";

export const Cover = ({ data }: { data: CatalogData }) => (
  <article className="a4 text-white" style={{ background: "radial-gradient(120% 90% at 50% -10%, #0c5a36 0%, #073d24 46%, #052e1b 100%)" }}>
    <div className="absolute inset-0 opacity-[.5] pointer-events-none"
      style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.04) 0 1px, transparent 1px 22px)" }}></div>

    <div className="relative flex h-full flex-col p-[16mm]">
      <header className="flex items-start justify-between">
        <Wordmark light logo={data.logoBlanco ?? data.logo} />
        <div className="text-right leading-tight">
          <div className="mono text-[10px] font-600 uppercase tracking-[.22em] text-mint-soft/80">Guía de campo</div>
          <div className="font-serif text-[22px] italic text-mint-soft">Edición {data.edicion}</div>
        </div>
      </header>

      <div className="mt-[14mm]">
        <Kicker light>Humedal de agua dulce · Veracruz, México</Kicker>
        <h1 className="mt-5 font-serif font-500 text-white" style={{ fontSize: "74px", lineHeight: ".96", letterSpacing: "-.01em" }}>
          Catálogo de aves<br />del humedal de<br />
          <span className="italic font-600 text-mint">Chirimoyo</span>
        </h1>
        <p className="mt-6 flex items-center gap-3 text-[16px] text-mint-soft/95">
          <span className="h-px w-9 bg-mint/60"></span>
          Comunidad Chirimoyo · Orizaba, Veracruz
        </p>
      </div>

      <Photo src={data.cover.photo} dark caption="Foto — insignia del catálogo"
        className="mt-[12mm] flex-1 rounded-[14px] ring-1 ring-mint/25 overflow-hidden">
        {data.cover.sci && (
          <div className="absolute left-5 top-5 rounded-full bg-pine-deep/70 px-3 py-1.5 text-[11px] font-600 uppercase tracking-[.16em] text-mint-soft ring-1 ring-mint/20">
            {data.cover.sci}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "linear-gradient(to top, rgba(5,46,27,.78), transparent)" }}></div>
        <div className="absolute left-6 bottom-5 right-6 flex items-end justify-between">
          <p className="font-serif italic text-[19px] text-white/95 max-w-[72%] leading-snug">
            «{data.total} especies que sostienen la vida del humedal»
          </p>
        </div>
      </Photo>

      <footer className="mt-[10mm] flex items-center justify-between border-t border-mint/20 pt-5">
        <div className="flex items-baseline gap-5">
          <span className="font-serif text-[30px] font-600 text-mint">{data.total}</span>
          <div className="leading-tight">
            <div className="text-[13px] font-600 text-white">especies documentadas</div>
            <div className="mono text-[10px] uppercase tracking-[.18em] text-mint-soft/70">Versión {data.edicion}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right leading-tight">
            <div className="text-[12px] font-600 text-white">Proyecto comunitario</div>
            <div className="text-[12px] text-mint-soft/80">de conservación del humedal</div>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-mint/30">
            <Icon name="feather" className="h-5 w-5 text-mint" />
          </span>
        </div>
      </footer>
    </div>
  </article>
);
