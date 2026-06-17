from flask import Flask
from flask_mail import Mail, Message

# Extensión Flask-Mail. Se inicializa en el factory (create_app). Reutilizable:
# el endpoint de contacto y, más adelante, la inscripción de voluntarios envían
# por aquí. Lee la configuración SMTP (MAIL_*) de Config.
mail = Mail()


def init_mail(app: Flask) -> None:
    """Liga Flask-Mail a la app. Llamar una vez desde create_app()."""
    mail.init_app(app)


def enviar_correo(asunto: str, destinatarios: list[str], cuerpo: str, responder_a: str | None = None) -> None:
    """Envía un correo de texto plano vía SMTP. Lanza si el envío falla; el
    caller decide cómo tratarlo (best-effort en contacto). Requiere contexto de
    app (presente dentro de un request)."""
    msg = Message(subject=asunto, recipients=destinatarios, body=cuerpo)
    if responder_a:
        msg.reply_to = responder_a
    mail.send(msg)
