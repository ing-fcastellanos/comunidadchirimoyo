import os
from typing import ClassVar

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuración mínima del API (ADR-0006). Sin JWT, pagos ni Meta."""

    # ClassVar: Config nunca se instancia (Flask lo consume vía
    # app.config.from_object(Config) como namespace estático), así que el dict
    # no se comparte entre instancias — solo se anota para que ruff (RUF012)
    # no lo confunda con un mutable default real.
    APP_CONFIG: ClassVar[dict] = {
        "ENV": os.getenv("ENV", "dev"),
        "APP_PORT": os.getenv("APP_PORT", "8080"),
        "CORS_ORIGINS": os.getenv(
            "CORS_ORIGINS",
            "https://chirimoyo.org,"
            "https://comunidad.chirimoyo.org,"
            "https://voluntarios.chirimoyo.org,"
            "http://localhost:3000",
        ),
    }

    DB_CONFIG: ClassVar[dict] = {
        # Base Firestore. (default) en northamerica-south1 (ver ADR-0003).
        "DB_NAME": os.getenv("DB_NAME", "(default)"),
    }

    # SMTP (Flask-Mail). El secreto real (MAIL_PASSWORD) NUNCA va en el repo:
    # se inyecta como variable/secret en Cloud Run. En local, sin credenciales,
    # el envío falla suave y la persistencia sigue funcionando (best-effort).
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")

    # Buzón interno que recibe el aviso de cada mensaje de contacto.
    CONTACTO_INBOX = os.getenv("CONTACTO_INBOX", "contacto@chirimoyo.org")

    # Buzón interno que recibe el aviso de cada inscripción de voluntario.
    VOLUNTARIOS_INBOX = os.getenv("VOLUNTARIOS_INBOX", "voluntarios@chirimoyo.org")

    # Base pública del propio API, para construir el link de desuscripción que
    # va DENTRO del correo (lo abre un humano en su navegador, a diferencia de
    # API_URL de sitio que es server-to-server). api.chirimoyo.org no tiene DNS
    # configurado (fuera de alcance del runbook de deploy, docs/guias/
    # desplegar-sitio-produccion.md) — el default es la URL real de Cloud Run.
    API_BASE_URL = os.getenv("API_BASE_URL", "https://api-9902000097.northamerica-south1.run.app")

    # Secreto compartido con apps/sitio para el trigger semanal de notificación
    # (mismo patrón que REVALIDATE_SECRET de sitio/admin). Server-only.
    NOTIFICAR_VOLUNTARIOS_SECRET = os.getenv("NOTIFICAR_VOLUNTARIOS_SECRET")
