/* validation.ts — validación del archivo de portada antes de subir (#142,
   design.md D4). Sin re-optimización/conversión: el archivo se guarda tal
   cual se recibió, solo se valida tipo y tamaño. */

const CONTENT_TYPES_VALIDOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

export interface ValidacionArchivo {
  ok: boolean;
  error?: string;
  extension?: string;
}

/** Valida content-type (enum cerrado) y tamaño. No lee el contenido del archivo. */
export function validarArchivoPortada(file: File): ValidacionArchivo {
  const extension = CONTENT_TYPES_VALIDOS[file.type];
  if (!extension) {
    return { ok: false, error: "Formato no soportado. Usa JPEG, PNG o WebP." };
  }
  if (file.size > TAMANO_MAXIMO_BYTES) {
    return { ok: false, error: "La imagen no puede pesar más de 5MB." };
  }
  return { ok: true, extension };
}
