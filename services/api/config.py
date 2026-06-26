import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuración mínima del API (ADR-0006). Sin JWT, pagos ni Meta."""

    APP_CONFIG = {
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

    DB_CONFIG = {
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
