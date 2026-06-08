/* Fuentes del catálogo — copia de docs/design-system/fonts.ts (next/font).
   Aplicadas como variables en <html> en app/layout.tsx. */
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";

export const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});
