import os

from app import create_app

# Punto de entrada para desarrollo local: `python app.py`.
# En Cloud Run se usa gunicorn con `app:create_app()` (ver Dockerfile).
app = create_app()

if __name__ == "__main__":
    app.run(
        debug=(os.environ.get("ENV", "dev") != "prod"),
        host="0.0.0.0",
        port=int(os.environ.get("APP_PORT", 8080)),
    )
