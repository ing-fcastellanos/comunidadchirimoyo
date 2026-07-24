from datetime import datetime
from html import escape

from flask import current_app

from app.datastore.inscripciones_datastore import listar_suscritos
from app.logging_utils import log_event
from app.services.email_service import enviar_correo, plantilla_html

# Mismas etiquetas que apps/sitio/components/voluntarios/ProximasJornadas.tsx
# (TIPO), para que el correo use el mismo vocabulario que el sitio.
_TIPO_ETIQUETA = {
    "limpieza": "Limpieza",
    "pajareada": "Pajareada",
    "evento": "Evento",
}

_DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
_MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]


def _formatear_fecha(fecha_iso: str) -> str:
    """'2026-07-30T16:30:00' → 'jueves 30 de julio, 16:30'. Si el string no es
    parseable, se devuelve tal cual (degradación segura, nunca lanza)."""
    try:
        dt = datetime.fromisoformat(fecha_iso)
    except (ValueError, TypeError):
        return fecha_iso
    dia = _DIAS[dt.weekday()]
    mes = _MESES[dt.month - 1]
    return f"{dia} {dt.day} de {mes}, {dt.strftime('%H:%M')}"


def _item_texto(item: dict) -> str:
    tipo = _TIPO_ETIQUETA.get(item.get("tipo", ""), "Jornada")
    fecha = _formatear_fecha(str(item.get("fecha", "")))
    lugar = item.get("lugar")
    linea = f"- {tipo}: {item.get('titulo', '')} — {fecha}"
    if lugar:
        linea += f" ({lugar})"
    return linea


def _item_html(item: dict) -> str:
    tipo = escape(_TIPO_ETIQUETA.get(item.get("tipo", ""), "Jornada"))
    fecha = escape(_formatear_fecha(str(item.get("fecha", ""))))
    titulo = escape(str(item.get("titulo", "")))
    lugar = item.get("lugar")
    lugar_html = f" · {escape(lugar)}" if lugar else ""
    return (
        f'<li style="margin:0 0 8px;"><strong>{tipo}:</strong> {titulo} — {fecha}{lugar_html}</li>'
    )


def notificar_semana(agenda: list[dict]) -> dict:
    """Envía el resumen semanal (un solo correo agregado) a cada voluntario con
    `suscrito == True`. Nunca lanza: un fallo de un envío individual no debe
    interrumpir el resto (best-effort, mismo criterio que contacto/inscripción).
    Devuelve un resumen de cuántos correos se intentaron/enviaron, sin PII."""
    if not agenda:
        return {"enviados": 0, "suscritos": 0}

    texto_agenda = "\n".join(_item_texto(i) for i in agenda)
    html_agenda = "<ul style=\"margin:0;padding-left:20px;\">" + "".join(
        _item_html(i) for i in agenda
    ) + "</ul>"

    base_url = current_app.config["API_BASE_URL"]
    suscritos = listar_suscritos()
    enviados = 0
    for voluntario in suscritos:
        correo = voluntario.get("correo")
        nombre = voluntario.get("nombre", "")
        doc_id = voluntario.get("id")
        if not correo or not doc_id:
            continue
        link_baja = f"{base_url}/api/voluntarios/desuscribir?id={doc_id}"
        try:
            enviar_correo(
                asunto="Esta semana en el humedal del Chirimoyo",
                destinatarios=[correo],
                cuerpo=(
                    f"Hola {nombre}:\n\n"
                    "Esto es lo que viene esta semana en el humedal:\n\n"
                    f"{texto_agenda}\n\n"
                    f"Si ya no quieres recibir este resumen, date de baja aquí: {link_baja}\n"
                ),
                html=plantilla_html(
                    "Esta semana en el humedal",
                    f'<p style="margin:0 0 12px;">Hola {escape(nombre)}:</p>'
                    '<p style="margin:0 0 12px;">Esto es lo que viene esta semana en el humedal:</p>'
                    f"{html_agenda}"
                    f'<p style="margin:16px 0 0;font-size:12px;">'
                    f'<a href="{link_baja}" style="color:#3a5547;">Darme de baja de este resumen</a></p>',
                ),
            )
            enviados += 1
        except Exception:
            log_event("notificar_semana_email_fallido")  # sin PII

    return {"enviados": enviados, "suscritos": len(suscritos)}
