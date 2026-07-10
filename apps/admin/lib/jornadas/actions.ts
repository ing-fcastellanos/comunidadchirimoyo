"use server";
/* actions.ts — server actions de escritura para el CRUD de jornadas (#141).
   Espejo del patrón de apps/admin/lib/noticias/actions.ts (D2 de
   noticias-admin: seguro porque no tocan cookies de sesión ni hacen
   redirect() dependiente de ellas). A diferencia de noticias, la
   revalidación es INCONDICIONAL (D3): no hay estado borrador/publicado.

   Todas requieren sesión válida: el gate de app/(authed)/layout.tsx ya impide
   llegar a estas páginas sin `__session` válida (capability auth-admin). */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "../firestore";
import { getSession } from "../session";
import { slugify } from "../noticias/slug";
import { existeJornada, getJornadaAdmin } from "./read";
import { revalidarJornadas } from "./revalidar";
import { validarJornada } from "./validation";
import type { JornadaFormInput, Recurrencia } from "./types";

const COLECCION = "jornadas";

export interface JornadaActionState {
  ok: boolean;
  errores?: Partial<Record<keyof JornadaFormInput, string>>;
  error?: string;
  avisoRevalidacion?: string;
}

function leerInput(formData: FormData): JornadaFormInput {
  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    tipo: String(formData.get("tipo") ?? "").trim() as JornadaFormInput["tipo"],
    hora: String(formData.get("hora") ?? "").trim(),
    lugar: String(formData.get("lugar") ?? "").trim(),
    inscripcion: formData.get("inscripcion") === "on",
    descripcion: String(formData.get("descripcion") ?? "").trim(),
    kind: String(formData.get("kind") ?? "").trim() as JornadaFormInput["kind"],
    recurrenciaTipo: String(formData.get("recurrenciaTipo") ?? "").trim() as JornadaFormInput["recurrenciaTipo"],
    dia: String(formData.get("dia") ?? "").trim() as JornadaFormInput["dia"],
    ordinales: formData.getAll("ordinales").map((v) => Number(v)).filter((n) => Number.isFinite(n)),
    fecha: String(formData.get("fecha") ?? "").trim(),
  };
}

async function exigirSesion(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado: sesión inválida o ausente.");
}

/** Construye la `recurrencia` a partir del input, ya validado. */
function construirRecurrencia(input: JornadaFormInput): Recurrencia {
  if (input.recurrenciaTipo === "mensual-ordinal") {
    return { tipo: "mensual-ordinal", dia: input.dia as Recurrencia["dia"], ordinales: input.ordinales };
  }
  return { tipo: "semanal", dia: input.dia as Recurrencia["dia"] };
}

/** Campos base compartidos por recurrente y evento. */
function camposBase(input: JornadaFormInput) {
  return {
    titulo: input.titulo,
    tipo: input.tipo,
    hora: input.hora,
    lugar: input.lugar || null,
    inscripcion: input.inscripcion,
    descripcion: input.descripcion || null,
  };
}

/** Crea una jornada nueva. `kind` se fija aquí y es inmutable después (D5). */
export async function crearJornada(
  _prevState: JornadaActionState,
  formData: FormData,
): Promise<JornadaActionState> {
  await exigirSesion();

  const input = leerInput(formData);
  if (input.kind !== "recurrente" && input.kind !== "evento") {
    return { ok: false, error: "Selecciona un tipo de jornada (recurrente o evento)." };
  }

  const { ok, errores } = validarJornada(input);
  if (!ok) return { ok: false, errores };

  const slug = slugify(input.titulo);
  if (!slug) {
    return { ok: false, errores: { titulo: "El título no produce un slug válido." } };
  }
  if (await existeJornada(slug)) {
    return { ok: false, error: `Ya existe una jornada con el slug "${slug}" (título muy similar).` };
  }

  const doc =
    input.kind === "recurrente"
      ? { ...camposBase(input), slug, kind: "recurrente" as const, recurrencia: construirRecurrencia(input) }
      : { ...camposBase(input), slug, kind: "evento" as const, fecha: input.fecha };

  await getDb().collection(COLECCION).doc(slug).set(doc);

  revalidatePath("/jornadas");
  await revalidarJornadas(); // incondicional (D3)
  redirect(`/jornadas/${slug}/editar`);
}

/** Actualiza los campos de una jornada existente. `slug` y `kind` no cambian
    (D4/D5) — `kind` se toma del documento existente, no del formulario. */
export async function actualizarJornada(
  slug: string,
  _prevState: JornadaActionState,
  formData: FormData,
): Promise<JornadaActionState> {
  await exigirSesion();

  const actual = await getJornadaAdmin(slug);
  if (!actual) return { ok: false, error: "La jornada ya no existe." };

  const input = leerInput(formData);
  input.kind = actual.kind; // el kind es inmutable; el form no lo envía editable
  const { ok, errores } = validarJornada(input);
  if (!ok) return { ok: false, errores };

  const update =
    actual.kind === "recurrente"
      ? { ...camposBase(input), recurrencia: construirRecurrencia(input) }
      : { ...camposBase(input), fecha: input.fecha };

  await getDb().collection(COLECCION).doc(slug).update(update);

  revalidatePath("/jornadas");
  revalidatePath(`/jornadas/${slug}/editar`);
  const resultado = await revalidarJornadas(); // incondicional (D3)

  return { ok: true, avisoRevalidacion: resultado.ok ? undefined : resultado.error };
}

/** Borra (hard delete) una jornada tras confirmación en la UI. */
export async function borrarJornada(slug: string): Promise<JornadaActionState> {
  await exigirSesion();

  const actual = await getJornadaAdmin(slug);
  if (!actual) return { ok: false, error: "La jornada ya no existe." };

  await getDb().collection(COLECCION).doc(slug).delete();

  revalidatePath("/jornadas");
  const resultado = await revalidarJornadas(); // incondicional (D3)

  return { ok: true, avisoRevalidacion: resultado.ok ? undefined : resultado.error };
}
