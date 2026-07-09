/* firestore.ts — cliente de Firestore SOLO server-side para el CRUD de noticias
   (#140) y jornadas (#141). Espejo de apps/sitio/lib/firestore.ts: init por ADC
   (Application Default Credentials), SIN llave JSON en el repo. En Cloud Run,
   ADC viene del service account runtime (requiere `roles/datastore.user`, ver
   runbook #144 — DISTINTO del `roles/iam.serviceAccountTokenCreator` que ya usa
   lib/firebase-admin.ts para Auth); en local, del emulator
   (`FIRESTORE_EMULATOR_HOST`) o de `gcloud auth application-default login`.
   Ver ADR-0028/ADR-0030 y la capability OpenSpec `contenido-dinamico`.

   NUNCA importar desde un Client Component: `firebase-admin` es Node-only. Las
   reglas de Firestore siguen `deny-all` para el client SDK (ADR-0012); todo el
   acceso legítimo del admin a `noticias`/`jornadas` es server-side vía este
   Admin SDK.

   Init LAZY + SINGLETON en `globalThis` (sobrevive al hot-reload de Next en
   desarrollo). Reusa la misma `App` que ya inicializa lib/firebase-admin.ts si
   corrió primero (getApps() la encuentra), o la inicializa aquí si Firestore
   es el primer cliente en usarse en un request dado. */
import { getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT ?? "chirimoyo";

const globalForFirestore = globalThis as unknown as {
  __chirimoyoAdminFirestore?: Firestore;
};

function initApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];
  return initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
}

/** Cliente Firestore server-only (lazy singleton). No instancia nada al importar. */
export function getDb(): Firestore {
  if (!globalForFirestore.__chirimoyoAdminFirestore) {
    globalForFirestore.__chirimoyoAdminFirestore = getFirestore(initApp());
  }
  return globalForFirestore.__chirimoyoAdminFirestore;
}
