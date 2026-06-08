# API mínima de Comunidad Chirimoyo — Flask en Cloud Run.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Factory de la app: gunicorn importa el paquete `app` y llama create_app().
CMD ["gunicorn", "-b", "0.0.0.0:8080", "--workers", "1", "--threads", "8", "--timeout", "60", "app:create_app()"]
