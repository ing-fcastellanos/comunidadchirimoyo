#!/usr/bin/env python3
"""Purga de inscripciones de voluntarios vencidas (politica de retencion, ADR-0012).

Borra de la coleccion `voluntarios_inscripciones` los documentos cuyo `creado_en`
supere el umbral de retencion. Por defecto conserva RETENCION_MESES meses tras la
creacion (config.py, fuente unica del umbral).

El borrado principal ahora es AUTOMATICO via la politica TTL de Firestore sobre el
campo `expira_en` (ADR-0027). Este script queda como RESPALDO: cubre (a) los
documentos escritos antes de introducir `expira_en`, que el TTL ignora, y (b) la
latencia best-effort del TTL (borra "dentro de 24 h, tipicamente hasta 72 h").
Filtra por `creado_en`, asi que no depende de que exista `expira_en`.

Uso (desde services/api/, con ADC del proyecto disponible):
    python -m scripts.purgar_inscripciones --dry-run      # lista, no borra
    python -m scripts.purgar_inscripciones                # borra (12 meses)
    python -m scripts.purgar_inscripciones --meses 6      # umbral distinto

Requiere credenciales de servidor (gcloud auth application-default login en local,
o la service account en Cloud Run). No imprime PII: solo IDs y conteos.
"""
import argparse
import sys
from datetime import datetime, timedelta, timezone

from google.cloud.firestore_v1 import FieldFilter

from app.config import RETENCION_MESES, getDbClient

_COLECCION = "voluntarios_inscripciones"


def _cutoff(meses: int) -> datetime:
    # Aproximacion de meses como 30 dias; suficiente para una purga de retencion.
    return datetime.now(timezone.utc) - timedelta(days=30 * meses)


def purgar(meses: int, dry_run: bool) -> int:
    db = getDbClient()
    corte = _cutoff(meses)
    docs = (
        db.collection(_COLECCION)
        .where(filter=FieldFilter("creado_en", "<", corte))
        .stream()
    )

    n = 0
    for doc in docs:
        n += 1
        if dry_run:
            print(f"[dry-run] vencida: {doc.id}")
        else:
            doc.reference.delete()
            print(f"borrada: {doc.id}")

    accion = "se borrarian" if dry_run else "borradas"
    print(f"\n{n} inscripcion(es) {accion} (creadas antes de {corte.date()}, umbral {meses} meses).")
    return n


def main() -> int:
    ap = argparse.ArgumentParser(description="Purga inscripciones de voluntarios vencidas.")
    ap.add_argument("--meses", type=int, default=RETENCION_MESES,
                    help=f"Meses de retencion desde la creacion (default {RETENCION_MESES}).")
    ap.add_argument("--dry-run", action="store_true",
                    help="Lista las inscripciones vencidas sin borrarlas.")
    args = ap.parse_args()

    if args.meses < 1:
        print("El umbral en meses debe ser >= 1.", file=sys.stderr)
        return 2

    purgar(args.meses, args.dry_run)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
