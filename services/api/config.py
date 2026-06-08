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

    # SMTP — placeholders. El envío de confirmaciones se implementa en Fase 4;
    # el secreto real (MAIL_PASSWORD) NO va en el repo.
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
