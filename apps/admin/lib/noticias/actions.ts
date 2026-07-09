"use server";
/* actions.ts — server actions de escritura para el CRUD de noticias (#140).
   Design.md D2: escrituras vía Server Actions (no route handlers) es seguro
   aquí porque NO tocan cookies de sesión ni hacen redirect() dependiente de
   ellas — el bug de #139 era específico a esa combinación bajo el rewrite de
   Firebase Hosting. El redirect() tras crear/borrar es navegación normal.

   Todas requieren sesión válida: el gate de app/(authed)/layout.tsx ya impide
   llegar a estas páginas sin `__session` válida (capability auth-admin). */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";

import { getDb } from "../firestore";
import { getSession } from "../session";
import { existeNoticia, getNoticiaAdmin } from "./read";
import { revalidarNoticias } from "./revalidar";
import { parseTags, validarNoticia } from "./validation";
import { slugify } from "./slug";
import type { NoticiaFormInput } from "./types";

const COLECCION = "noticias";

export interface NoticiaActionState {
  ok: boolean;
  errores?: Partial<Record<keyof NoticiaFormInput, string>>;
  error?: string;
  avisoRevalidacion?: string;
}

function leerInput(formData: FormData): NoticiaFormInput {
  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    fecha: String(formData.get("fecha") ?? "").trim(),
    resumen: String(formData.get("resumen") ?? "").trim(),
    autor: String(formData.get("autor") ?? "").trim(),
    portada: String(formData.get("portada") ?? "").trim(),
    portadaAlt: String(formData.get("portadaAlt") ?? "").trim(),
    tags: String(formData.get("tags") ?? "").trim(),
    cuerpo: String(formData.get("cuerpo") ?? "").trim(),
  };
}

/** Requiere una sesión válida (defensa en profundidad; el layout ya gatea la
    página, pero un server action puede invocarse directo). */
async function exigirSesion(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado: sesión inválida o ausente.");
}

/** Crea una noticia nueva. Siempre nace en `estado: "borrador"` (la
    publicación es una acción aparte, ver alternarEstado) — nunca dispara
    revalidación porque un borrador no es visible en el sitio. */
export async function crearNoticia(
  _prevState: NoticiaActionState,
  formData: FormData,
): Promise<NoticiaActionState> {
  await exigirSesion();

  const input = leerInput(formData);
  const { ok, errores } = validarNoticia(input);
  if (!ok) return { ok: false, errores };

  const slug = slugify(input.titulo);
  if (!slug) {
    return { ok: false, errores: { titulo: "El título no produce un slug válido." } };
  }
  if (await existeNoticia(slug)) {
    return { ok: false, error: `Ya existe una noticia con el slug "${slug}" (título muy similar).` };
  }

  const now = FieldValue.serverTimestamp();
  await getDb()
    .collection(COLECCION)
    .doc(slug)
    .set({
      titulo: input.titulo,
      slug,
      fecha: input.fecha,
      resumen: input.resumen,
      autor: input.autor || null,
      portada: input.portada || null,
      portadaAlt: input.portadaAlt || null,
      estado: "borrador",
      tags: parseTags(input.tags),
      cuerpo: input.cuerpo,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    });

  revalidatePath("/noticias");
  redirect(`/noticias/${slug}/editar`);
}

/** Actualiza los campos editoriales de una noticia existente (no el slug ni
    el estado, que tienen sus propios flujos). Si la noticia YA estaba
    publicada, dispara la revalidación (D5: el contenido público cambió). */
export async function actualizarNoticia(
  slug: string,
  _prevState: NoticiaActionState,
  formData: FormData,
): Promise<NoticiaActionState> {
  await exigirSesion();

  const actual = await getNoticiaAdmin(slug);
  if (!actual) return { ok: false, error: "La noticia ya no existe." };

  const input = leerInput(formData);
  const { ok, errores } = validarNoticia(input);
  if (!ok) return { ok: false, errores };

  await getDb()
    .collection(COLECCION)
    .doc(slug)
    .update({
      titulo: input.titulo,
      fecha: input.fecha,
      resumen: input.resumen,
      autor: input.autor || null,
      portada: input.portada || null,
      portadaAlt: input.portadaAlt || null,
      tags: parseTags(input.tags),
      cuerpo: input.cuerpo,
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidatePath("/noticias");
  revalidatePath(`/noticias/${slug}/editar`);

  let avisoRevalidacion: string | undefined;
  if (actual.estado === "publicado") {
    const resultado = await revalidarNoticias();
    if (!resultado.ok) avisoRevalidacion = resultado.error;
  }

  return { ok: true, avisoRevalidacion };
}

/** Alterna `estado` entre `borrador` y `publicado`. `publishedAt` se fija SOLO
    la primera vez que pasa a `publicado` (D4); nunca se sobreescribe después.
    Siempre dispara revalidación (D5: la visibilidad pública cambió en ambos
    sentidos — publicar y despublicar). */
export async function alternarEstado(
  slug: string,
  nuevoEstado: "borrador" | "publicado",
): Promise<NoticiaActionState> {
  await exigirSesion();

  const actual = await getNoticiaAdmin(slug);
  if (!actual) return { ok: false, error: "La noticia ya no existe." };

  const doc = await getDb().collection(COLECCION).doc(slug).get();
  const publishedAtActual = doc.data()?.publishedAt ?? null;

  const update: Record<string, unknown> = {
    estado: nuevoEstado,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (nuevoEstado === "publicado" && !publishedAtActual) {
    update.publishedAt = FieldValue.serverTimestamp();
  }

  await getDb().collection(COLECCION).doc(slug).update(update);

  revalidatePath("/noticias");
  const resultado = await revalidarNoticias();

  return { ok: true, avisoRevalidacion: resultado.ok ? undefined : resultado.error };
}

/** Borra (hard delete) una noticia tras confirmación en la UI. Si estaba
    publicada, dispara revalidación (deja de ser visible en el sitio). */
export async function borrarNoticia(slug: string): Promise<NoticiaActionState> {
  await exigirSesion();

  const actual = await getNoticiaAdmin(slug);
  if (!actual) return { ok: false, error: "La noticia ya no existe." };

  await getDb().collection(COLECCION).doc(slug).delete();

  revalidatePath("/noticias");

  let avisoRevalidacion: string | undefined;
  if (actual.estado === "publicado") {
    const resultado = await revalidarNoticias();
    if (!resultado.ok) avisoRevalidacion = resultado.error;
  }

  return { ok: true, avisoRevalidacion };
}
