import logging
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS
from pythonjsonlogger import jsonlogger
from werkzeug.exceptions import HTTPException

from app.logging_utils import log_event
from config import Config


def _configure_logging(env: str) -> None:
    """Logging JSON a stdout (Cloud Logging lo estructura).
    Regla dura (ADR-0012): nunca loguear cuerpos de request (PII)."""
    level = logging.DEBUG if env != "prod" else logging.INFO
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    )
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    env = Config.APP_CONFIG["ENV"]
    _configure_logging(env)
    _set_cors(app)
    _init_mail(app)
    _register_blueprints(app)
    _register_error_handler(app)

    @app.after_request
    def _security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        return response

    logging.getLogger("chirimoyo.api").info("API Chirimoyo iniciada", extra={"env": env})
    return app


def _init_mail(app: Flask) -> None:
    # Flask-Mail para las notificaciones de contacto (best-effort). Lee MAIL_*
    # de Config. Reutilizable por voluntarios más adelante.
    from app.services.email_service import init_mail

    init_mail(app)


def _set_cors(app: Flask) -> Flask:
    origins = [o.strip() for o in Config.APP_CONFIG["CORS_ORIGINS"].split(",") if o.strip()]
    # El catálogo (aves) NO se incluye: es estático y no llama al API (ADR-0005).
    CORS(app, resources={r"/api/*": {"origins": origins}})
    return app


def _register_blueprints(app: Flask) -> Flask:
    import app.controllers.health_controller as health_ctl
    import app.controllers.voluntarios_controller as voluntarios_ctl
    import app.controllers.contacto_controller as contacto_ctl

    app.register_blueprint(health_ctl.bp)  # /health (sin prefijo)
    app.register_blueprint(voluntarios_ctl.bp, url_prefix="/api/voluntarios")
    app.register_blueprint(contacto_ctl.bp, url_prefix="/api/contacto")
    return app


def _register_error_handler(app: Flask) -> Flask:
    # Red de seguridad para excepciones no capturadas por los try/except locales
    # de los controladores (ruta futura, bug en after_request, etc). Deja pasar
    # las HTTPException (404, 405...) sin modificar: Flask ya las maneja bien y
    # este handler NO SHALL cambiar su contrato (#26).
    @app.errorhandler(Exception)
    def _manejar_excepcion(exc: Exception):
        if isinstance(exc, HTTPException):
            return exc
        log_event("error_no_manejado", exception_type=type(exc).__name__, path=request.path)
        return jsonify({"error": "Ocurrió un error inesperado"}), 500

    return app
