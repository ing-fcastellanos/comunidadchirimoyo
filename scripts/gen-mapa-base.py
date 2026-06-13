#!/usr/bin/env python3
"""Genera el asset del mapa base de distribución (#27 / ADR-0018).

Lee Natural Earth admin-0 1:110m (dominio público), filtra a las Américas,
recorta al encuadre Norte + Centroamérica + Caribe (+ norte de Sudamérica),
proyecta equirectangular y emite `apps/catalogo/lib/mapa-americas.ts` con:

    { viewBox, marker, outline, regions: { <ISO_A2>: pathSVG } }

El crudo de Natural Earth NO se versiona; solo este asset derivado.

Fuente: nvkelso/natural-earth-vector `geojson/ne_110m_admin_0_countries.geojson`
        (Natural Earth, dominio público — sin atribución requerida).

Uso:
    python scripts/gen-mapa-base.py --src <geojson> [--out <ts>]
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DEFAULT_OUT = REPO / "apps" / "catalogo" / "lib" / "mapa-americas.ts"

# Encuadre: Norte + Centroamérica + Caribe (+ norte de Sudamérica).
LON_MIN, LON_MAX = -168.0, -52.0
LAT_MIN, LAT_MAX = -10.0, 62.0

# Lienzo: equirectangular con corrección de longitud por cos(lat media) para
# que no se estire en este-oeste. Altura fija; ancho derivado.
H = 600.0
MID_LAT = (LAT_MIN + LAT_MAX) / 2.0
DEG_TO_Y = H / (LAT_MAX - LAT_MIN)
X_SCALE = DEG_TO_Y * math.cos(math.radians(MID_LAT))
W = round((LON_MAX - LON_MIN) * X_SCALE, 1)

# Laguna del Chirimoyo (Orizaba, Veracruz).
LAGUNA_LON, LAGUNA_LAT = -97.10, 18.85

# Margen de tolerancia (grados) para descartar anillos totalmente fuera de vista
# (p. ej. las islas Aleutianas o territorios lejanos).
MARGEN = 4.0


def project(lon: float, lat: float) -> tuple[float, float]:
    x = (lon - LON_MIN) * X_SCALE
    y = (LAT_MAX - lat) * DEG_TO_Y
    return round(x, 1), round(y, 1)


def iso_de(props: dict) -> str | None:
    iso = props.get("ISO_A2")
    if iso in ("-99", "", None):
        iso = props.get("ISO_A2_EH")
    return iso if iso not in ("-99", "", None) else None


def ring_fuera(ring: list) -> bool:
    """True si el anillo está completamente fuera del encuadre (con margen)."""
    lons = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    return (
        max(lons) < LON_MIN - MARGEN or min(lons) > LON_MAX + MARGEN or
        max(lats) < LAT_MIN - MARGEN or min(lats) > LAT_MAX + MARGEN
    )


def ring_path(ring: list) -> str | None:
    pts = [project(lon, lat) for lon, lat in ring]
    if len(pts) < 3:
        return None
    d = f"M{pts[0][0]} {pts[0][1]}"
    for x, y in pts[1:]:
        d += f"L{x} {y}"
    return d + "Z"


def geom_path(geom: dict) -> str:
    """Une todos los anillos (exteriores y huecos) en un solo path."""
    tipo = geom["type"]
    if tipo == "Polygon":
        poligonos = [geom["coordinates"]]
    elif tipo == "MultiPolygon":
        poligonos = geom["coordinates"]
    else:
        return ""
    partes: list[str] = []
    for poly in poligonos:
        for ring in poly:
            if ring_fuera(ring):
                continue
            p = ring_path(ring)
            if p:
                partes.append(p)
    return "".join(partes)


def main() -> int:
    ap = argparse.ArgumentParser(description="Generar el mapa base de distribución.")
    ap.add_argument("--src", type=Path, required=True,
                    help="GeoJSON de Natural Earth admin-0 1:110m.")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = ap.parse_args()

    data = json.loads(args.src.read_text(encoding="utf-8"))
    regions: dict[str, str] = {}
    for feat in data["features"]:
        props = feat["properties"]
        if props.get("CONTINENT") not in ("North America", "South America"):
            continue
        iso = iso_de(props)
        if not iso:
            continue
        path = geom_path(feat["geometry"])
        if path:
            regions[iso] = path

    regions = dict(sorted(regions.items()))
    outline = "".join(regions.values())
    mx, my = project(LAGUNA_LON, LAGUNA_LAT)

    ts = [
        "/* mapa-americas.ts — asset del mapa base de distribución (#27 / ADR-0018).",
        " * GENERADO por scripts/gen-mapa-base.py desde Natural Earth admin-0 1:110m",
        " * (dominio público). NO editar a mano; regenerar con el script.",
        " * Encuadre: Norte + Centroamérica + Caribe (+ norte de Sudamérica),",
        " * proyección equirectangular. Las claves de `regions` son ISO 3166-1 alpha-2. */",
        "",
        "export interface MapaBase {",
        "  /** viewBox del SVG en el espacio proyectado. */",
        "  viewBox: string;",
        "  /** Posición del marcador de la Laguna del Chirimoyo. */",
        "  marker: { x: number; y: number };",
        "  /** Silueta de toda la tierra en vista (un solo path), para el relleno base. */",
        "  outline: string;",
        "  /** Path SVG por código ISO 3166-1 alpha-2, para pintar zonas. */",
        "  regions: Record<string, string>;",
        "}",
        "",
        "export const MAPA_BASE: MapaBase = {",
        f'  viewBox: "0 0 {W:g} {H:g}",',
        f"  marker: {{ x: {mx:g}, y: {my:g} }},",
        f"  outline: {json.dumps(outline)},",
        "  regions: {",
    ]
    for iso, path in regions.items():
        ts.append(f"    {json.dumps(iso)}: {json.dumps(path)},")
    ts += ["  },", "};", ""]

    args.out.write_text("\n".join(ts), encoding="utf-8")
    print(f"Regiones: {len(regions)}  ({', '.join(regions)})")
    print(f"viewBox: 0 0 {W:g} {H:g}  ·  marker: ({mx:g}, {my:g})")
    print(f"Escrito: {args.out.relative_to(REPO)}  ({args.out.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
