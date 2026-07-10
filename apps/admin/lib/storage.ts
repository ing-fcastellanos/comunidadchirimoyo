/* storage.ts — cliente de Cloud Storage SOLO server-side para la subida de
   portadas (#142). Espejo de lib/firestore.ts/lib/firebase-admin.ts: init por
   ADC (Application Default Credentials), SIN llave JSON en el repo. En Cloud
   Run, ADC viene del service account runtime (requiere `roles/storage.objectAdmin`
   sobre el bucket `comunidad-chirimoyo` — ver runbook #144, DISTINTO de
   `roles/datastore.user` de Firestore y `roles/iam.serviceAccountTokenCreator`
   de Auth). En local, de `gcloud auth application-default login`.

   Bucket público de lectura (ADR-0021) — este cliente solo se usa para
   ESCRIBIR objetos nuevos; la lectura pública ya la sirve GCS directo, sin
   pasar por este código.

   Init LAZY + SINGLETON en `globalThis` (sobrevive al hot-reload de Next en
   desarrollo), mismo patrón que los demás clientes server-only del admin.
   NUNCA importar desde un Client Component: `@google-cloud/storage` es
   Node-only. */
import { Storage, type Bucket } from "@google-cloud/storage";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT ?? "chirimoyo";
const BUCKET_NAME = "comunidad-chirimoyo";

const globalForStorage = globalThis as unknown as {
  __chirimoyoStorageBucket?: Bucket;
};

/** Bucket de comunidad, server-only (lazy singleton). No instancia nada al importar. */
export function getComunidadBucket(): Bucket {
  if (!globalForStorage.__chirimoyoStorageBucket) {
    const storage = new Storage({ projectId: PROJECT_ID });
    globalForStorage.__chirimoyoStorageBucket = storage.bucket(BUCKET_NAME);
  }
  return globalForStorage.__chirimoyoStorageBucket;
}
