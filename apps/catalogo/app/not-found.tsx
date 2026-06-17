/* not-found.tsx — pantalla 404 de la guía de aves (aves.chirimoyo.org) con
   identidad del proyecto. Server Component. Mismo diseño genérico que sitio;
   los enlaces se adaptan: "inicio" = home del catálogo, búsqueda interna y la
   comunidad (única URL externa en lib/links.ts). */
import {
  BadgeEstado,
  BloqueError,
  BotonPrimario,
  EnlaceTexto,
  FlechaInline,
  IlustracionHumedal,
} from "@/components/error/PantallasError";
import { COMUNIDAD_URL } from "@/lib/links";

export default function NotFound() {
  return (
    <BloqueError aria-label="Página no encontrada">
      <IlustracionHumedal acento="var(--color-forest-soft)" variante="vuela" />

      <BadgeEstado tono="forest">Error 404</BadgeEstado>

      <h1 className="mt-5 font-serif text-[40px] font-semibold leading-[1.05] text-pretty text-forest-deep sm:text-[54px]">
        Esta página voló del humedal
      </h1>

      <p className="mt-4 max-w-md text-[17px] leading-relaxed text-pretty text-ink-soft">
        La dirección que buscas no existe o se mudó de nido. Volvamos a tierra firme.
      </p>

      <div className="mt-8">
        <BotonPrimario href="/">
          Volver al inicio
          <FlechaInline className="h-[18px] w-[18px]" />
        </BotonPrimario>
      </div>

      <div className="mt-6 flex flex-col items-center gap-x-6 gap-y-2 sm:flex-row">
        <EnlaceTexto href="/busqueda">Buscar aves</EnlaceTexto>
        <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-ink-soft/30 sm:block" />
        <EnlaceTexto href={COMUNIDAD_URL}>Conocer a la comunidad</EnlaceTexto>
      </div>
    </BloqueError>
  );
}
