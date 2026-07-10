/* subir.ts — sube el buffer de la portada al bucket de comunidad (#142,
   design.md D5). Nombre determinístico atado al slug: una subida posterior
   para la misma noticia sobreescribe el objeto anterior en la misma ruta
   (no acumula huérfanos por re-subidas). NO escribe en Firestore (D9): solo
   sube el archivo y devuelve la ruta relativa. */
import { getComunidadBucket } from "../storage";

/** Ruta relativa del objeto (sin resolver a URL pública), coherente con la
    convención de content/noticias/README.md (`noticias/<archivo>.webp`). */
export function rutaPortada(slug: string, extension: string): string {
  return `noticias/${slug}-portada.${extension}`;
}

/** Sube el buffer al bucket, sobreescribiendo si ya existe. Devuelve la ruta
    relativa guardada (para completar el campo `portada` del formulario). */
export async function subirPortada(
  slug: string,
  extension: string,
  contentType: string,
  buffer: Buffer,
): Promise<string> {
  const ruta = rutaPortada(slug, extension);
  await getComunidadBucket().file(ruta).save(buffer, { contentType });
  return ruta;
}
