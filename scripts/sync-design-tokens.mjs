#!/usr/bin/env node
/* =====================================================================
   sync-design-tokens.mjs — propaga el sistema de diseño canónico a las apps.
   Copia docs/design-system/tokens.css → apps/<app>/app/tokens.css.
   Multiplataforma (Node). Idempotente. Tolera apps inexistentes.
   Uso: node scripts/sync-design-tokens.mjs
   ===================================================================== */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonical = join(root, "docs", "design-system", "tokens.css");
const appsDir = join(root, "apps");

if (!existsSync(canonical)) {
  console.error(`✗ No existe el canónico: ${canonical}`);
  process.exit(1);
}

const content = readFileSync(canonical);

if (!existsSync(appsDir)) {
  console.log("No hay apps/ todavía; nada que sincronizar.");
  process.exit(0);
}

let synced = 0;
for (const entry of readdirSync(appsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const appDir = join(appsDir, entry.name, "app");
  // Solo apps Next ya scaffoldeadas (con carpeta app/)
  if (!existsSync(appDir)) continue;
  const dest = join(appDir, "tokens.css");
  writeFileSync(dest, content);
  console.log(`✓ ${entry.name}/app/tokens.css sincronizado`);
  synced++;
}

console.log(
  synced
    ? `Listo — ${synced} app(s) sincronizada(s) desde el canónico.`
    : "No se encontró ninguna app con carpeta app/ (¿aún sin scaffold?)."
);
