#!/usr/bin/env python3
"""Purga de inscripciones de voluntarios vencidas (politica de retencion, ADR-0012).

Borra de la coleccion `voluntarios_inscripciones` los documentos cuyo `creado_en`
supere el umbral de retencion. Por defecto conserva 12 meses tras la creacion.
La automatizacion (Firestore TTL) es una mejora futura; este script es el medio
de borrado manual mientras tanto.

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

from app.config import getDbClient

_COLECCION = "voluntarios_inscripciones"
_MESES_DEFAULT = 12


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
    ap.add_argument("--meses", type=int, default=_MESES_DEFAULT,
                    help=f"Meses de retencion desde la creacion (default {_MESES_DEFAULT}).")
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
