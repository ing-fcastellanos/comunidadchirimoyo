/* photo-aspect.mjs — fuente única de verdad del recuadro de foto de la ficha.
   El catálogo usa A4 (210mm), padding lateral 14mm, grid 1.32fr/1fr con gap
   de 1.5rem (24px) y la foto con alto fijo de 78mm. De ahí sale el aspecto. */
const A4_W = 210, PAD = 14, GAP_PX = 24, PHOTO_H_MM = 78;
const GAP_MM = (GAP_PX / 96) * 25.4;               // 24px → mm
const contentW = A4_W - 2 * PAD;                   // 182mm
const colsW = contentW - GAP_MM;                   // ancho de las dos columnas
const leftW = colsW * (1.32 / (1.32 + 1));         // columna de la foto
export const PHOTO_W_MM = leftW;                   // ≈ 99.9mm
export const PHOTO_H = PHOTO_H_MM;                 // 78mm
export const PHOTO_ASPECT = leftW / PHOTO_H_MM;    // ≈ 1.281 (ancho/alto)
