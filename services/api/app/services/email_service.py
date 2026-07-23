from flask import Flask
from flask_mail import Mail, Message

# Extensión Flask-Mail. Se inicializa en el factory (create_app). Reutilizable:
# el endpoint de contacto y, más adelante, la inscripción de voluntarios envían
# por aquí. Lee la configuración SMTP (MAIL_*) de Config.
mail = Mail()


def init_mail(app: Flask) -> None:
    """Liga Flask-Mail a la app. Llamar una vez desde create_app()."""
    mail.init_app(app)


def enviar_correo(
    asunto: str,
    destinatarios: list[str],
    cuerpo: str,
    responder_a: str | None = None,
    html: str | None = None,
) -> None:
    """Envía un correo vía SMTP. `cuerpo` (texto plano) siempre se manda como
    fallback; si se pasa `html`, el correo queda multipart (la mayoría de
    clientes muestra el HTML, los que no lo soportan caen al texto plano).
    Lanza si el envío falla; el caller decide cómo tratarlo (best-effort en
    contacto/inscripción). Requiere contexto de app (presente dentro de un
    request)."""
    msg = Message(subject=asunto, recipients=destinatarios, body=cuerpo, html=html)
    if responder_a:
        msg.reply_to = responder_a
    mail.send(msg)


def plantilla_html(titulo: str, cuerpo_html: str) -> str:
    """Envuelve contenido en una plantilla HTML mínima con la identidad de
    marca (verde bosque — mismos tokens que apps/sitio/app/tokens.css, ADR-0013
    tokens compartidos por copia). Sin imágenes externas: no depende de que el
    cliente de correo las cargue. `cuerpo_html` son los párrafos específicos de
    cada correo (ya escapados/formados por el caller)."""
    return f"""\
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#eef5ef;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef5ef;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#0c5a36;padding:20px 28px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.02em;">Comunidad Chirimoyo</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#143226;font-size:15px;line-height:1.6;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#0c5a36;">{titulo}</h1>
                {cuerpo_html}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background-color:#e1eee5;color:#3a5547;font-size:12px;">
                Por la defensa del humedal de Chirimoyo · <a href="https://chirimoyo.org" style="color:#15824c;">chirimoyo.org</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
