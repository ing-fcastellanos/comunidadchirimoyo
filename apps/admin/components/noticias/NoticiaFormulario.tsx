"use client";
/* NoticiaFormulario.tsx — formulario de crear/editar noticia (#140). Un solo
   componente para los dos modos (D3): en "crear" no hay slug todavía (se
   deriva del título server-side); en "editar" el slug se muestra pero
   deshabilitado (inmutable). Usa useActionState (React 19) contra el server
   action pasado en `accion` — crearNoticia redirige server-side al éxito
   (D2: seguro porque no toca cookies de sesión); actualizarNoticia devuelve
   {ok:true} y este componente muestra la confirmación inline. */
import { useActionState } from "react";
import { Campo } from "./Campo";
import { EditorCuerpo } from "./EditorCuerpo";
import { EstadoBadge } from "./EstadoBadge";
import { AlternarEstadoBoton } from "./AlternarEstadoBoton";
import { Icon } from "@/components/ui/Icon";
import type { Noticia } from "@/lib/noticias/types";
import type { NoticiaActionState } from "@/lib/noticias/actions";

const FOCO = "focus:outline-none focus-visible:ring-4 focus-visible:ring-mint/40";

const ESTADO_INICIAL: NoticiaActionState = { ok: false };

interface Props {
  modo: "crear" | "editar";
  noticia?: Noticia;
  accion: (prevState: NoticiaActionState, formData: FormData) => Promise<NoticiaActionState>;
}

export function NoticiaFormulario({ modo, noticia, accion }: Props) {
  const [estado, formAction, enviando] = useActionState(accion, ESTADO_INICIAL);
  const errores = estado.errores ?? {};

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center gap-2 text-[13px] text-ink-soft">
        <a href="/noticias" className={`font-semibold text-forest hover:underline ${FOCO} rounded`}>
          Noticias
        </a>
        <Icon name="ChevronRight" className="h-3.5 w-3.5" />
        <span>{modo === "crear" ? "Nueva noticia" : "Editar noticia"}</span>
      </div>

      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-semibold leading-tight text-forest-deep">
            {modo === "crear" ? "Nueva noticia" : "Editar noticia"}
          </h1>
          {modo === "editar" && noticia && (
            <div className="mt-2 flex items-center gap-2">
              <EstadoBadge estado={noticia.estado} />
              <span className="font-mono text-[13px] text-ink-soft">/{noticia.slug}</span>
            </div>
          )}
        </div>
        {modo === "editar" && noticia && (
          <AlternarEstadoBoton slug={noticia.slug} estado={noticia.estado} />
        )}
      </header>

      {estado.error && (
        <div role="alert" className={`mb-6 flex items-start gap-3 rounded-xl bg-[#f6e1da] px-4 py-3.5 text-[14px] font-semibold text-[#8f3c25] ring-1 ring-[#b5543a]/20 ${FOCO}`}>
          <Icon name="TriangleAlert" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{estado.error}</span>
        </div>
      )}
      {Object.keys(errores).length > 0 && (
        <div role="alert" className={`mb-6 flex items-start gap-3 rounded-xl bg-[#f6e1da] px-4 py-3.5 text-[14px] font-semibold text-[#8f3c25] ring-1 ring-[#b5543a]/20 ${FOCO}`}>
          <Icon name="TriangleAlert" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>Revisa los campos marcados abajo antes de guardar.</span>
        </div>
      )}
      {modo === "editar" && estado.ok && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-xl bg-mint-wash px-4 py-3.5 text-[14px] font-semibold text-forest-deep ring-1 ring-forest/15">
          <Icon name="Check" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            Cambios guardados.
            {estado.avisoRevalidacion && ` No se pudo avisar al sitio: ${estado.avisoRevalidacion}`}
          </span>
        </div>
      )}

      <form action={formAction} className="rounded-2xl bg-paper-card p-6 shadow-card ring-1 ring-forest/10 sm:p-8">
        <div className="flex flex-col gap-5">
          <Campo id="titulo" etiqueta="Título" requerido defaultValue={noticia?.titulo} error={errores.titulo} />

          {modo === "editar" && noticia && (
            <Campo
              id="slug"
              etiqueta="Slug (URL)"
              defaultValue={noticia.slug}
              disabled
              ayuda="El slug no se puede editar: cambia la URL del sitio y rompería enlaces ya compartidos."
            />
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Campo id="fecha" etiqueta="Fecha" tipo="date" requerido defaultValue={noticia?.fecha} error={errores.fecha} />
            <Campo id="autor" etiqueta="Autor" defaultValue={noticia?.autor ?? ""} placeholder="Opcional" />
          </div>

          <Campo
            id="resumen"
            etiqueta="Resumen"
            textarea
            filas={2}
            requerido
            defaultValue={noticia?.resumen}
            error={errores.resumen}
            ayuda="Una o dos frases: se usa en el listado público y OpenGraph."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Campo
              id="portada"
              etiqueta="Portada"
              defaultValue={noticia?.portada ?? ""}
              placeholder="noticias/archivo.webp"
              ayuda="Ruta relativa dentro del bucket de comunidad (ya subida)."
            />
            <Campo
              id="portadaAlt"
              etiqueta="Texto alternativo"
              defaultValue={noticia?.portadaAlt ?? ""}
              error={errores.portadaAlt}
              placeholder="Describe la imagen"
            />
          </div>

          <Campo
            id="tags"
            etiqueta="Etiquetas"
            defaultValue={noticia?.tags.join(", ") ?? ""}
            error={errores.tags}
            placeholder="jornada, limpieza, comunidad"
            ayuda="Separadas por coma, en kebab-case."
          />

          <EditorCuerpo defaultValue={noticia?.cuerpo ?? ""} error={errores.cuerpo} />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="submit"
            disabled={enviando}
            className={`inline-flex h-11 items-center gap-2 rounded-xl bg-forest px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(12,90,54,.7)] transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-80 ${FOCO}`}
          >
            {enviando ? (
              <>
                <Icon name="LoaderCircle" className="h-[18px] w-[18px] animate-spin" />
                Guardando…
              </>
            ) : modo === "crear" ? (
              "Crear noticia"
            ) : (
              "Guardar cambios"
            )}
          </button>
          <a href="/noticias" className={`text-[14px] font-semibold text-ink-soft hover:text-ink ${FOCO} rounded`}>
            Cancelar
          </a>
        </div>
      </form>
    </main>
  );
}
