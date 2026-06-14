/* SpeciesSheet.tsx — Ficha de especie (una por hoja A4). Plantilla reutilizable
   poblada con datos reales. Portado de print/SpeciesSheet.jsx. */
import React from "react";
import { Chip, CodeSeal, QR, Photo, Icon } from "./shared";
import type { SpeciesVM } from "./types";

const SideBlock = ({ icon, title, children, last }:
  { icon: string; title: string; children: React.ReactNode; last?: boolean }) => (
  <div className={`px-5 py-3 ${last ? "" : "border-b rule-soft"}`}>
    <div className="mb-2.5 flex items-center gap-2">
      <Icon name={icon} className="h-[15px] w-[15px] text-forest" />
      <span className="text-[10px] font-700 uppercase tracking-[.18em] text-forest">{title}</span>
    </div>
    {children}
  </div>
);

const TaxRow = ({ k, v, italic }: { k: string; v: string; italic?: boolean }) => (
  <div className="flex items-baseline justify-between gap-3 py-[3px]">
    <span className="text-[11px] uppercase tracking-[.1em] text-ink-soft/70">{k}</span>
    <span className={`text-[13px] font-600 text-ink ${italic ? "font-serif italic" : ""}`}>{v}</span>
  </div>
);

const TextBlock = ({ icon, title, children }:
  { icon: string; title: string; children: React.ReactNode }) => (
  <div className="flex flex-col">
    <div className="mb-2 flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-mint-wash ring-1 ring-forest/12">
        <Icon name={icon} className="h-[15px] w-[15px] text-forest-deep" />
      </span>
      <h3 className="font-serif text-[19px] font-600 leading-none text-forest-deep">{title}</h3>
    </div>
    <p className="text-[11.5px] leading-[1.45] text-ink-soft line-clamp-6">{children}</p>
  </div>
);

export const SpeciesSheet = ({ data, logo }: { data: SpeciesVM; logo?: string | null }) => (
  <article className="a4 flex flex-col bg-paper text-ink">
    {/* banda de cabecera */}
    <header className="relative px-[14mm] pt-[11mm] pb-[7mm] text-white"
      style={{ background: "linear-gradient(108deg, #052e1b 0%, #0c5a36 60%, #15824c 100%)" }}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-700 uppercase tracking-[.14em]"
            style={{ background: data.gremioTone.bg, color: data.gremioTone.fg }}>
            <Icon name="bird" className="h-[13px] w-[13px]" />{data.gremio}
          </span>
          <h2 className="mt-3 font-serif font-500 leading-none" style={{ fontSize: "52px" }}>{data.common}</h2>
          <p className="mt-2 font-serif text-[22px] text-mint-soft">
            <span className="italic">{data.sci}</span>
            {data.authority && <span className="ml-2 text-[15px] not-italic text-mint-soft/75">{data.authority}</span>}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end pt-1">
          <div className="mono text-[10px] uppercase tracking-[.18em] text-mint-soft/70">Ficha</div>
          <div className="font-serif text-[34px] font-600 leading-none text-mint">{String(data.n).padStart(2, "0")}</div>
          {logo && <img src={logo} alt="" className="mt-2.5 object-contain" style={{ height: 76, width: 76 }} />}
        </div>
      </div>
      {data.otros && (
        <p className="mt-3 text-[12.5px] text-mint-soft/90">
          <span className="font-700 uppercase tracking-[.12em] text-[10.5px] text-mint-soft/70">Otros nombres&nbsp;&nbsp;</span>
          {data.otros}
        </p>
      )}
    </header>

    {/* cuerpo */}
    <div className="flex min-h-0 flex-1 flex-col px-[14mm] pt-[7mm] pb-[12mm]">
      {/* fila foto + barra de datos */}
      <div className="grid shrink-0 grid-cols-[1.32fr_1fr] items-start gap-6">
        {/* foto (altura fija: la imagen recorta con object-cover, nunca se alarga) */}
        <figure className="flex flex-col">
          <Photo src={data.photo} caption={data.photoCaption}
            className="h-[74mm] rounded-xl ring-1 ring-forest/12 overflow-hidden" />
          <figcaption className="mt-2 flex items-center justify-between text-[10px] text-ink-soft/70">
            <span className="mono">{data.credit}</span>
            {data.license && <span className="mono rounded bg-paper-deep px-1.5 py-0.5 text-forest-deep/80">{data.license}</span>}
          </figcaption>
        </figure>

        {/* barra de datos */}
        <aside className="flex flex-col overflow-hidden rounded-xl bg-paper-card"
          style={{ boxShadow: "var(--shadow-card)" }}>
          <SideBlock icon="badge-check" title="Estado">
            <div className="flex flex-col gap-1.5 items-start">
              {data.status.map((s) => <Chip key={s.value} tone={s.tone} label={s.label} value={s.value} />)}
            </div>
          </SideBlock>
          <SideBlock icon="shield" title="Conservación">
            <div className="flex flex-wrap items-center gap-2">
              <CodeSeal system="IUCN" code={data.iucn.code} tone={data.iucn.tone} />
              <CodeSeal system="NOM-059" code={data.nom} tone="ink" />
            </div>
          </SideBlock>
          <SideBlock icon="git-branch" title="Taxonomía" last>
            <TaxRow k="Orden" v={data.orden} />
            <TaxRow k="Familia" v={data.familia} />
            {data.genero && <TaxRow k="Género" v={data.genero} italic />}
          </SideBlock>
        </aside>
      </div>

      {/* banda a todo el ancho: medidas + hábitat (aprovecha el espacio bajo la foto) */}
      <div className="mt-[6mm] grid shrink-0 grid-cols-[auto_1fr] gap-5 rounded-xl bg-paper-card px-5 py-3.5"
        style={{ boxShadow: "var(--shadow-card)" }}>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Icon name="ruler" className="h-[15px] w-[15px] text-forest" />
            <span className="text-[10px] font-700 uppercase tracking-[.18em] text-forest">Medidas</span>
          </div>
          <div className="flex gap-2.5">
            {data.medidas.map((m) => (
              <div key={m.k} className="w-[26mm] rounded-lg bg-mint-wash px-2 py-2 text-center ring-1 ring-forest/8">
                <div className="text-[9px] font-700 uppercase tracking-[.08em] text-forest/70">{m.k}</div>
                <div className="mt-0.5 font-serif text-[19px] font-600 leading-none text-forest-deep">{m.v}</div>
                <div className="text-[9.5px] text-ink-soft/70">{m.u}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-l rule-soft pl-5">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="map-pin" className="h-[15px] w-[15px] text-forest" />
            <span className="text-[10px] font-700 uppercase tracking-[.18em] text-forest">Hábitat y observación</span>
          </div>
          {data.habitat && <p className="text-[12.5px] leading-snug text-ink">{data.habitat}</p>}
          {data.cuando && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-forest-deep">
              <Icon name="clock" className="h-[13px] w-[13px]" />{data.cuando}
            </p>
          )}
        </div>
      </div>

      {/* bloques de texto (solo los presentes); cada uno acotado con line-clamp */}
      <div className="mt-[7mm] grid grid-cols-2 content-start gap-x-9 gap-y-4">
        {data.blocks.desc && <TextBlock icon="file-text" title="Descripción">{data.blocks.desc}</TextBlock>}
        {data.blocks.id && <TextBlock icon="scan-eye" title="Cómo identificarla">{data.blocks.id}</TextBlock>}
        {data.blocks.sabias && <TextBlock icon="sparkles" title="¿Sabías que?">{data.blocks.sabias}</TextBlock>}
        {data.blocks.donde && <TextBlock icon="binoculars" title="Dónde y cuándo observarla">{data.blocks.donde}</TextBlock>}
      </div>

      {/* franja inferior: registro + QR (empujada al fondo del cuerpo) */}
      <div className="mt-auto flex shrink-0 items-center justify-between gap-6 rounded-xl bg-paper-deep/55 px-5 py-3.5 ring-1 ring-forest/10">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-forest-deep text-mint-soft">
            <Icon name="pencil-line" className="h-[17px] w-[17px]" />
          </span>
          <div className="leading-tight">
            <div className="text-[12.5px] font-700 text-forest-deep">¿La observaste? Regístrala.</div>
            <p className="text-[11px] text-ink-soft">Anota fecha, hora y sitio en la laguna; tu registro alimenta el monitoreo comunitario.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="text-right leading-tight">
            <div className="mono text-[9.5px] font-600 uppercase tracking-[.12em] text-forest-deep">Ficha completa</div>
            <div className="mono text-[9px] text-ink-soft/75">en línea · aves.chirimoyo.org</div>
          </div>
          <QR src={data.qr} size={62} />
        </div>
      </div>
    </div>
  </article>
);
