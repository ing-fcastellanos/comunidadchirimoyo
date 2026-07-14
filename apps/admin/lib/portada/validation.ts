/* validation.ts — validación del archivo de portada antes de subir (#142,
   design.md D4; magic bytes agregados en #143, revisión de seguridad D2).
   Sin re-optimización/conversión: el archivo se guarda tal cual se recibió,
   solo se valida tipo, tamaño y firma binaria real. */

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

/** Valida content-type (enum cerrado) y tamaño. No lee el contenido del archivo:
    el content-type es el que declara el cliente (falsificable, ver
    verificarFirmaBinaria) y el tamaño ya lo expone `File` sin leer bytes. */
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

/** Firmas binarias (magic bytes) de los 3 formatos soportados. El content-type
    que declara el cliente en el multipart es solo una etiqueta que él mismo
    controla — trivial de falsificar (demostrado en la verificación e2e de
    #142 armando un `File` con `type` arbitrario). Esta es la verificación
    real, sobre los bytes que ya están en memoria antes de subir. */
const FIRMAS: Record<string, (buffer: Buffer) => boolean> = {
  jpg: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png: (b) => b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  webp: (b) =>
    b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
};

/** ¿Los primeros bytes del buffer coinciden con la firma real del formato
    esperado (`extension`, ya determinada por validarArchivoPortada)? */
export function verificarFirmaBinaria(buffer: Buffer, extension: string): boolean {
  return FIRMAS[extension]?.(buffer) ?? false;
}
