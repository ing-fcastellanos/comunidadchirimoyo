/* smoke-firestore.mjs — verificación mínima de la capa de acceso a Firestore
   (Fase 6, issue #134). Escribe un documento efímero, lo lee y lo borra: prueba
   conectividad, credenciales (ADC o emulator) y el round-trip del contrato, sin
   depender del seed (#135).

   Uso (cross-platform):
     node scripts/smoke-firestore.mjs --emulator   # contra el Firestore emulator (localhost:8085)
     node scripts/smoke-firestore.mjs              # contra prod vía ADC (valida el IAM real)

   Init mínimo, ESPEJO de lib/firestore.ts. Es un diagnóstico standalone: no
   importa el módulo TS para poder correr con `node` sin tsx. */
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const useEmulator = process.argv.includes("--emulator");
if (useEmulator && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8085";
}
const emulator = process.env.FIRESTORE_EMULATOR_HOST;
const projectId = process.env.GOOGLE_CLOUD_PROJECT ?? "chirimoyo";

console.log(emulator ? `smoke-firestore · emulator ${emulator}` : "smoke-firestore · prod (ADC)");

function db() {
  const app = getApps().length
    ? getApps()[0]
    : initializeApp(emulator ? { projectId } : { credential: applicationDefault(), projectId });
  return getFirestore(app);
}

const COL = "_smoke";
const ID = "ping";
const payload = { ok: true, ts: new Date().toISOString(), origen: "smoke-firestore" };

async function main() {
  const ref = db().collection(COL).doc(ID);
  await ref.set(payload); // write
  const snap = await ref.get(); // read
  if (!snap.exists) throw new Error("lectura falló: el documento no existe tras escribir");
  if (snap.data()?.origen !== payload.origen) {
    throw new Error("round-trip inconsistente: " + JSON.stringify(snap.data()));
  }
  await ref.delete(); // delete
  if ((await ref.get()).exists) throw new Error("borrado falló: el documento sigue existiendo");
  console.log("  ✓ write · read · delete OK — capa de acceso a Firestore funcional");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("  ✗ smoke-firestore falló:", e.message);
    if (!emulator) {
      console.error("    (prod: revisa ADC `gcloud auth application-default login` y el rol roles/datastore.user en el SA)");
    }
    process.exit(1);
  });
