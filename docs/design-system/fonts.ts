/* =====================================================================
   fonts.ts — Configuración de fuentes del sistema de diseño (next/font).
   Copiar a cada app (p. ej. apps/<app>/app/fonts.ts) durante el scaffold.
   Derivado de la guía de estilo del handoff v0.dev.
   ===================================================================== */
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";

/* Serif editorial — títulos, nombres comunes/científicos y citas.
   Itálica reservada para el nombre científico. */
export const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/* Sans humanista — cuerpo y etiquetas. Interlineado recomendado 1.6–1.75. */
export const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

/* La monoespaciada (pies de foto) usa el stack del sistema definido en
   tokens.css (--font-mono); no se carga un webfont adicional.

   Uso en el root layout:
     import { serif, sans } from "./fonts";
     <html lang="es" className={`${serif.variable} ${sans.variable}`}>
*/
