/* Proximamente.tsx — placeholder "próximamente" reusable para las superficies
   del catálogo aún no disponibles (índices de grupo sin datos y búsqueda general).
   Estado intencional, no error: comunica que el contenido llega pronto y ofrece
   una salida de regreso. Server Component, usa tokens y primitivas del sistema. */
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

export function Proximamente({
  eyebrow,
  titulo,
  descripcion,
  icon = "Sprout",
}: {
  eyebrow: string;
  titulo: string;
  descripcion: string;
  icon?: IconName;
}) {
  return (
    <Section className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-mint-wash text-forest-deep ring-1 ring-forest/10">
          <Icon name={icon} className="h-8 w-8" />
        </span>
        <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.24em] text-forest">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-serif text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] text-forest-deep text-balance">
          {titulo}
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink/75 text-pretty">
          {descripcion}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-forest px-6 py-3.5 text-[16px] font-semibold text-paper-card shadow-card transition-colors hover:bg-forest-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
          >
            Volver al inicio
            <Icon name="ArrowRight" className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/aves"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest/25 bg-paper-card/60 px-6 py-3.5 text-[16px] font-semibold text-forest-deep transition-colors hover:border-forest/40 hover:bg-paper-card focus:outline-none focus-visible:ring-4 focus-visible:ring-forest/25"
          >
            Ver las aves
          </Link>
        </div>
      </div>
    </Section>
  );
}
