import type { Metadata } from "next";
import { Proximamente } from "@/components/grupo/Proximamente";

/* Stub «próximamente» de /busqueda. El buscador general (multi-grupo, sobre el
   núcleo común del esquema) se construye en #85; el buscador de aves vive en
   /aves/buscador. La URL canónica se reserva para su inquilino definitivo. */

export const metadata: Metadata = { title: "Búsqueda" };

export default function BusquedaStub() {
  return (
    <Proximamente
      icon="Search"
      eyebrow="Búsqueda general"
      titulo="Busca en toda la fauna"
      descripcion="Estamos construyendo el buscador general de todo el ecosistema. Mientras tanto, explora el buscador de aves."
    />
  );
}
