/* Closing.tsx — Cierre: créditos, fuentes, licencias y llamado a la acción.
   Portado de print/Closing.jsx. */
import React from "react";
import { Kicker, QR, Icon, Wordmark } from "./shared";
import type { CatalogData } from "./types";

const DarkCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl p-5 ${className}`}
    style={{ background: "rgba(255,255,255,.055)", boxShadow: "inset 0 0 0 1px rgba(142,216,192,.22)" }}>
    {children}
  </div>
);

export const Closing = ({ data }: { data: CatalogData }) => (
  <article className="a4 relative text-white"
    style={{ background: "radial-gradient(125% 100% at 50% 0%, #0c5a36 0%, #073d24 50%, #052e1b 100%)" }}>
    <div className="absolute inset-0 opacity-[.5] pointer-events-none"
      style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.04) 0 1px, transparent 1px 22px)" }}></div>

    <div className="relative flex h-full flex-col p-[16mm]">
      <header className="flex items-end justify-between border-b border-mint/20 pb-6">
        <div>
          <Kicker light>Créditos · Fuentes · Licencias</Kicker>
          <h2 className="mt-3 font-serif font-500 leading-none text-white" style={{ fontSize: "46px" }}>
            Hecho por la comunidad,<br />para el <span className="italic text-mint">humedal</span>
          </h2>
        </div>
        <Wordmark light compact logo={data.logoBlanco ?? data.logo} />
      </header>

      <div className="mt-8 grid grid-cols-2 gap-7">
        <DarkCard>
          <div className="mb-3 flex items-center gap-2 text-mint">
            <Icon name="camera" className="h-[16px] w-[16px]" />
            <span className="text-[11px] font-700 uppercase tracking-[.18em]">Créditos fotográficos</span>
          </div>
          <ul className="grid grid-cols-1 gap-y-1">
            {data.credits.map((c) => (
              <li key={c.name} className="flex items-baseline justify-between gap-3 py-[2px]">
                <span className="font-serif italic text-[14px] leading-tight text-white/95">{c.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {c.license && <span className="rounded bg-mint/15 px-1.5 py-0.5 text-[9.5px] font-600 text-mint">{c.license}</span>}
                  <span className="mono text-[11px] tabular-nums text-mint-soft/80">{c.count}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10.5px] leading-snug text-mint-soft/70">
            Fotógrafos de la colección (nº de fotos). La atribución de cada foto aparece en su ficha.
          </p>
        </DarkCard>

        <DarkCard>
          <div className="mb-3 flex items-center gap-2 text-mint">
            <Icon name="library" className="h-[16px] w-[16px]" />
            <span className="text-[11px] font-700 uppercase tracking-[.18em]">Fuentes consultadas</span>
          </div>
          <ul className="space-y-2.5">
            {data.fuentes.map((s) => (
              <li key={s.name} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mint"
                  style={{ background: "rgba(142,216,192,.12)" }}>
                  <Icon name="bookmark" className="h-[16px] w-[16px]" />
                </span>
                <div className="leading-tight">
                  <div className="text-[14px] font-600 text-white">{s.name}</div>
                  <div className="text-[11px] text-mint-soft/75">{s.org}</div>
                </div>
              </li>
            ))}
          </ul>
        </DarkCard>
      </div>

      <DarkCard className="mt-7">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2 text-mint shrink-0 pt-0.5">
            <Icon name="scale" className="h-[16px] w-[16px]" />
            <span className="text-[11px] font-700 uppercase tracking-[.18em]">Licencias</span>
          </div>
          <p className="text-[12.5px] leading-[1.55] text-mint-soft/90">
            Salvo indicación contraria, las fotografías se publican bajo
            <span className="mx-1 rounded bg-mint/15 px-1.5 py-0.5 font-600 text-mint">CC BY-NC 4.0</span>
            y los textos bajo
            <span className="mx-1 rounded bg-mint/15 px-1.5 py-0.5 font-600 text-mint">CC BY-SA 4.0</span>.
            Puedes compartirlos y adaptarlos sin fines de lucro, citando a «Comunidad Chirimoyo».
          </p>
        </div>
      </DarkCard>

      <div className="mt-auto grid grid-cols-[1.6fr_1fr] gap-7 rounded-2xl p-7"
        style={{ background: "linear-gradient(105deg, #15824c, #0c5a36)", boxShadow: "inset 0 0 0 1px rgba(142,216,192,.3)" }}>
        <div>
          <Kicker light>Cómo contribuir</Kicker>
          <h3 className="mt-2.5 font-serif text-[30px] font-600 leading-tight text-white">Defiende el humedal de Chirimoyo</h3>
          <ul className="mt-4 grid grid-cols-1 gap-2.5">
            {([
              ["binoculars", "Aprende a reconocer las especies del humedal con esta guía y el catálogo en línea."],
              ["hand-heart", "Súmate a las jornadas de limpieza y reforestación de las orillas."],
              ["megaphone", "Reporta descargas, rellenos o caza al comité del humedal."],
            ] as const).map(([ic, tx]) => (
              <li key={tx} className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/15 text-mint-soft">
                  <Icon name={ic} className="h-[15px] w-[15px]" />
                </span>
                <span className="text-[13px] leading-snug text-mint-soft/95">{tx}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-mint/25 pl-6">
          <QR src={data.qrSitio} size={104} label={data.meta.sitioLabel} sub="Únete al proyecto" light />
        </div>
      </div>

      <footer className="mt-6 flex items-center justify-between text-[10.5px] text-mint-soft/65">
        <span className="mono uppercase tracking-[.2em]">{data.meta.footerTitulo} · v.{data.edicion}</span>
        <span className="flex items-center gap-2">
          <Icon name="feather" className="h-[13px] w-[13px]" />
          Comunidad Chirimoyo · Orizaba, Veracruz
        </span>
      </footer>
    </div>
  </article>
);
