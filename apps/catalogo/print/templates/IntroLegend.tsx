/* IntroLegend.tsx — Introducción + leyenda del sistema de insignias.
   Portado de print/IntroLegend.jsx. */
import React from "react";
import { Kicker, Chip, CodeSeal, QR, Icon } from "./shared";
import type { CatalogData } from "./types";

const LegendCard = ({ title, hint, children }:
  { title: string; hint: string; children: React.ReactNode }) => (
  <div className="rounded-xl bg-paper-card p-4 ring-1 ring-forest/10" style={{ boxShadow: "0 1px 2px rgba(7,61,36,.05)" }}>
    <div className="mb-1 flex items-baseline justify-between">
      <h3 className="font-serif text-[20px] font-600 text-forest-deep">{title}</h3>
      <span className="mono text-[9.5px] uppercase tracking-[.14em] text-ink-soft/55">{hint}</span>
    </div>
    <div className="mt-2.5 space-y-2">{children}</div>
  </div>
);

const LegendRow = ({ chip, gloss }: { chip: React.ReactNode; gloss: string }) => (
  <div className="flex items-center gap-3">
    <span className="shrink-0">{chip}</span>
    <span className="text-[12.5px] leading-snug text-ink-soft">{gloss}</span>
  </div>
);

const Step = ({ icon, title, children }:
  { icon: string; title: string; children: React.ReactNode }) => (
  <div className="flex gap-3">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-mint-wash text-forest-deep ring-1 ring-forest/12">
      <Icon name={icon} className="h-[18px] w-[18px]" />
    </span>
    <div>
      <div className="text-[13px] font-700 text-forest-deep">{title}</div>
      <p className="text-[12px] leading-snug text-ink-soft">{children}</p>
    </div>
  </div>
);

export const IntroLegend = ({ data }: { data: CatalogData }) => (
  <article className="a4 bg-paper text-ink">
    <header className="flex items-center justify-between gap-6 px-[16mm] pt-[12mm] pb-[6mm] text-white"
      style={{ background: "linear-gradient(110deg, #073d24, #0c5a36)" }}>
      <div>
        <Kicker light>Introducción</Kicker>
        <h2 className="mt-3 font-serif text-[44px] font-500 leading-none">Un humedal vivo, ave por ave</h2>
      </div>
      {data.logoBlanco && (
        <img src={data.logoBlanco} alt="" className="shrink-0 object-contain"
          style={{ height: 76, width: 76 }} />
      )}
    </header>

    <div className="px-[16mm] pt-[6mm] pb-[9mm]">
      <div className="grid grid-cols-[1.45fr_1fr] gap-6">
        <div>
          <p className="font-serif text-[17.5px] leading-[1.5] text-ink">
            El humedal de <span className="italic text-forest-deep">Chirimoyo</span>, es una laguna urbana al 
            norte de Orizaba que filtra el agua, amortigua las inundaciones y da refugio a decenas de especies. 
            Es una de las últimas zonas húmedas vivas de la ciudad.
          </p>
          <p className="mt-4 text-[13px] leading-[1.62] text-ink-soft">
            Esta guía reúne las especies que la comunidad ha observado y documentado. Cada ficha resume, en una
            sola página, lo esencial para reconocer un ave en el campo y entender su papel en el ecosistema.
            Consérvala seca, anota tus avistamientos y compártelos: cada registro ayuda a defender el humedal.
          </p>
        </div>
        <div className="rounded-xl bg-paper-deep/60 p-4 ring-1 ring-forest/10">
          <Kicker className="mb-3">Cómo usar esta guía</Kicker>
          <div className="space-y-3">
            <Step icon="search" title="Observa y compara">Fíjate en tamaño, color, pico y dónde está el ave.</Step>
            <Step icon="book-open" title="Lee la ficha">Las insignias resumen estatus, rareza y protección.</Step>
            <Step icon="map-pin" title="Registra el sitio">Anota fecha, hora y lugar de tu avistamiento.</Step>
          </div>
        </div>
      </div>

      <div className="mt-5 mb-3 flex items-center gap-4">
        <h2 className="font-serif text-[30px] font-600 text-forest-deep">Cómo leer la ficha</h2>
        <span className="h-px flex-1 bg-forest/15"></span>
        <span className="mono text-[10px] uppercase tracking-[.16em] text-ink-soft/60">Sistema de insignias</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LegendCard title="Estatus migratorio" hint="presencia">
          <LegendRow chip={<Chip tone="teal" value="Residente" />} gloss="Vive en el humedal todo el año." />
          <LegendRow chip={<Chip tone="ochre" value="Migratoria de invierno" />} gloss="Visita en la temporada fría." />
          <LegendRow chip={<Chip tone="ochre" value="Migratoria de verano" />} gloss="Llega a reproducirse en la época cálida." />
          <LegendRow chip={<Chip tone="terra" value="Transitoria" />} gloss="Solo de paso durante la migración." />
        </LegendCard>

        <LegendCard title="Grado de ocurrencia" hint="qué tan seguido">
          <LegendRow chip={<Chip tone="forest" value="Común" />} gloss="Se observa con facilidad en cada visita." />
          <LegendRow chip={<Chip tone="ochre" value="Poco común" />} gloss="Aparece de vez en cuando." />
          <LegendRow chip={<Chip tone="terra" value="Rara" />} gloss="Registros escasos o esporádicos." />
        </LegendCard>

        <LegendCard title="Distribución" hint="origen">
          <LegendRow chip={<Chip tone="forest" value="Nativa" />} gloss="Propia de la región de forma natural." />
          <LegendRow chip={<Chip tone="terra" value="Introducida" />} gloss="Traída por el ser humano, no nativa." />
        </LegendCard>

        <LegendCard title="Conservación" hint="iucn · nom-059">
          <div className="flex flex-wrap items-center gap-1.5">
            <CodeSeal system="IUCN" code="LC" tone="forest" />
            <CodeSeal system="IUCN" code="NT" tone="ochre" />
            <CodeSeal system="IUCN" code="VU" tone="ochre" />
            <CodeSeal system="IUCN" code="EN" tone="terra" />
            <CodeSeal system="IUCN" code="CR" tone="terra" />
          </div>
          <p className="text-[11.5px] leading-snug text-ink-soft">Lista Roja: de <b>LC</b> (preocupación menor) a <b>CR</b> (peligro crítico).</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <CodeSeal system="NOM-059" code="Pr" tone="ochre" />
            <CodeSeal system="NOM-059" code="A" tone="ochre" />
            <CodeSeal system="NOM-059" code="P" tone="terra" />
            <CodeSeal system="NOM-059" code="E" tone="terra" />
          </div>
          <p className="text-[11.5px] leading-snug text-ink-soft">Norma mexicana: <b>Pr</b> sujeta a protección, <b>A</b> amenazada, <b>P</b> en peligro, <b>E</b> probablemente extinta. «—» sin categoría.</p>
        </LegendCard>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl px-6 py-3 text-white"
        style={{ background: "linear-gradient(100deg, #0c5a36, #15824c)" }}>
        <div>
          <Kicker light className="mb-1.5">Consulta en línea</Kicker>
          <p className="text-[13px] text-mint-soft/95 max-w-[78%] leading-snug">
            Fichas ampliadas, cantos y mapas de cada especie, más formas de sumarte al monitoreo comunitario.
          </p>
        </div>
        <div className="shrink-0 -my-1">
          <QR src={data.qrSitio} size={92} label="aves.chirimoyo.org" sub="Visita el sitio" light />
        </div>
      </div>
    </div>
  </article>
);
