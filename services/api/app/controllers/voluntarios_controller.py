from flask import Blueprint, jsonify

bp = Blueprint("voluntarios", __name__)


@bp.route("", methods=["GET", "POST"], strict_slashes=False)
def inscripcion():
    """STUB. La inscripción de voluntarios (validación, escritura en Firestore,
    email de confirmación, privacidad/consentimiento — ADR-0012) se implementa
    en Fase 4."""
    return (
        jsonify(
            {
                "error": "No implementado",
                "detail": "Inscripción de voluntarios — pendiente Fase 4",
            }
        ),
        501,
    )
