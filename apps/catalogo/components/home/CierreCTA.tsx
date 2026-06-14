/* CierreCTA.tsx — banda final oscura (pine-deep) con botón claro. Portado del
   handoff v0.dev. Repite la llamada a la acción principal hacia el buscador. */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function CierreCTA() {
  return (
    <section className="relative overflow-hidden bg-pine-deep">
      {/* veladura sutil de textura, sin gradientes llamativos */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #8ed8c0 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-16 sm:py-24 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-mint">
            <Icon name="Bird" className="h-4 w-4" />
            Catálogo de fauna
          </div>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-semibold leading-[1.05] text-paper text-balance">
            Empieza a explorar la fauna del Chirimoyo
          </h2>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/busqueda"
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-mint px-7 py-4 text-[17px] font-semibold text-pine-deep shadow-card transition-colors hover:bg-mint-deep hover:text-paper focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
          >
            Ir al catálogo
            <Icon
              name="ArrowRight"
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="/catalogo-aves-chirimoyo.pdf"
            download
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-[17px] font-semibold text-mint ring-1 ring-mint/40 transition-colors hover:bg-mint/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40"
          >
            Descargar guía en PDF
            <Icon name="Download" className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
