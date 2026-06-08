from flask import Blueprint, jsonify

bp = Blueprint("contacto", __name__)


@bp.route("", methods=["GET", "POST"], strict_slashes=False)
def contacto():
    """STUB. El formulario de contacto (validación, persistencia/reenvío por
    email) se implementa en Fase 4."""
    return (
        jsonify(
            {
                "error": "No implementado",
                "detail": "Formulario de contacto — pendiente Fase 4",
            }
        ),
        501,
    )
