"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * Analítica web respetuosa de la privacidad — Cloudflare Web Analytics (ADR-0020,
 * supersede ADR-0010 en la elección de herramienta).
 *
 * Sin cookies, sin almacenamiento en el navegador, sin PII, sin banner de
 * consentimiento. Seguimiento POR DOMINIO: un "site"/token de Cloudflare por
 * dominio. El componente resuelve el token según el host actual.
 *
 * Config por entorno (NEXT_PUBLIC_*, ver `.env.example`):
 *   - NEXT_PUBLIC_CF_BEACON_TOKENS: JSON `{ "<host>": "<token>", ... }`.
 *
 * Degradación segura: si falta la config o el host no está mapeado
 * (localhost, preview), no inyecta nada y la app funciona con normalidad.
 *
 * NOTA: copia sincronizada entre `apps/sitio` y `apps/catalogo` (ADR-0013,
 * compartir por copia; no hay tooling de monorepo).
 */
const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

export function Analytics() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = process.env.NEXT_PUBLIC_CF_BEACON_TOKENS;
    if (!raw) return;

    let tokens: Record<string, string>;
    try {
      tokens = JSON.parse(raw);
    } catch {
      return;
    }

    const t = tokens[window.location.hostname];
    if (t) setToken(t);
  }, []);

  if (!token) return null;

  return (
    <Script
      src={BEACON_SRC}
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
