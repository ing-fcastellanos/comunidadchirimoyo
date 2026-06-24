/* IndiceGrupo.tsx — índice de un grupo de fauna (server): encabezado + grilla
   plana de cards con todas las especies del grupo, ordenadas alfabéticamente.
   Reemplaza el placeholter «Próximamente» para los grupos con fichas (#84). El
   landing curado de aves vive aparte (LandingAves en app/[grupo]/page.tsx). */
import { GRUPO_LABEL, type Grupo } from "@/lib/fauna-schema";
import type { Especie } from "@/lib/search";
import { EspecieCard } from "@/components/search/EspecieCard";

/** Intro breve por grupo (i18n-ready: string aislado). Fallback genérico para
    grupos futuros sin copy propio. */
const INTRO: Partial<Record<Grupo, string>> = {
  anfibios: "Ranas, sapos y salamandras que viven en el humedal y sus orillas.",
  reptiles: "Lagartijas, serpientes y tortugas que habitan el humedal y su entorno.",
};
const INTRO_FALLBACK = "Especies de este grupo documentadas en el humedal del Chirimoyo.";

export function IndiceGrupo({ grupo, especies }: { grupo: Grupo; especies: Especie[] }) {
  const label = GRUPO_LABEL[grupo];
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <header className="pt-8 sm:pt-10">
        <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
          Catálogo de fauna · {label}
        </p>
        <h1 className="mt-2 font-serif text-[clamp(28px,4vw,42px)] font-semibold leading-[1.05] text-forest-deep">
          {label} del Chirimoyo
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink/75">
          <strong className="font-semibold text-forest">{especies.length} especies</strong>
          {" — "}
          {INTRO[grupo] ?? INTRO_FALLBACK}
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {especies.map((e) => (
          <EspecieCard key={e.id} bird={e} view="grid" />
        ))}
      </div>
    </div>
  );
}
