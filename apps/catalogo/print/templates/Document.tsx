/* Document.tsx — ensambla las páginas A4 del catálogo en orden:
   portada · intro+leyenda · índice (1..K) · fichas (×N) · cierre. */
import React from "react";
import { Cover } from "./Cover";
import { IntroLegend } from "./IntroLegend";
import { IndexPage } from "./IndexPage";
import { SpeciesSheet } from "./SpeciesSheet";
import { Closing } from "./Closing";
import type { CatalogData } from "./types";

export const Document = ({ data }: { data: CatalogData }) => (
  <div className="stage">
    <Cover data={data} />
    <IntroLegend data={data} />
    {data.indexPages.map((p, i) => <IndexPage key={`ix${i}`} page={p} total={data.total} meta={data.meta} />)}
    {data.species.map((s) => <SpeciesSheet key={s.slug} data={s} logo={data.logoBlanco} />)}
    <Closing data={data} />
  </div>
);
