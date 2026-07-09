/* slug.ts — derivación del slug (doc ID) a partir del título (#140, D3). El
   slug es INMUTABLE una vez creado (ver design.md D3): cambiarlo implicaría
   borrar+recrear el documento y rompería cualquier URL/OG ya compartida del
   detalle en apps/sitio. */

/** kebab-case sin tildes/ñ/diacríticos, coherente con content/noticias/README.md. */
export function slugify(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos (incluye la tilde de ñ→n)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
