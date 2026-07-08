/* firestore.ts — cliente de Firestore SOLO server-side para el contenido dinámico
   de la Fase 6 (noticias, jornadas). Usa Firebase Admin SDK (Node) e inicializa
   por ADC (Application Default Credentials): SIN llave JSON en el repo. En Cloud
   Run, ADC viene del service account runtime (requiere `roles/datastore.user`,
   ver runbook #144); en local, del emulator (`FIRESTORE_EMULATOR_HOST`) o de
   `gcloud auth application-default login`. Ver ADR-0028 (contenido dinámico) y
   la capability OpenSpec `contenido-dinamico`.

   NUNCA importar desde un Client Component: `firebase-admin` es Node-only y las
   credenciales son de servidor. El acceso a estas colecciones es 100% server-side;
   las reglas de Firestore siguen `deny-all` para el client SDK (ADR-0012).

   Init LAZY + SINGLETON, cacheado en `globalThis` para sobrevivir al hot-reload
   de Next en desarrollo (evita "app already exists" y multiplicar conexiones),
   mismo espíritu que el `getDbClient` lazy de services/api. */
import { getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/** Proyecto GCP; en Cloud Run lo provee ADC. `chirimoyo` como fallback local. */
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT ?? "chirimoyo";

const globalForFirestore = globalThis as unknown as {
  __chirimoyoFirestore?: Firestore;
};

function initApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];
  // Con FIRESTORE_EMULATOR_HOST presente (dev), el Admin SDK enruta al emulator
  // automáticamente; las credenciales ADC no se contactan. Ver tarea 4.1.
  return initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
}

/** Cliente Firestore server-only (lazy singleton). No instancia nada al importar. */
export function getDb(): Firestore {
  if (!globalForFirestore.__chirimoyoFirestore) {
    globalForFirestore.__chirimoyoFirestore = getFirestore(initApp());
  }
  return globalForFirestore.__chirimoyoFirestore;
}
