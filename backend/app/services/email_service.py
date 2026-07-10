from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig,
)

from backend.app.core.config import get_settings
from backend.app.services.qr_service import (
    generate_qr,
)

settings = get_settings()

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=True,
)


async def send_registration_email(
    email: str,
    participant_name: str,
    event_name: str,
    registration_id: int,
):
    qr_file = generate_qr(
        registration_id
    )

    html = f"""
    <h2>Registration Successful 🎉</h2>

    <p>Hello {participant_name},</p>

    <p>
        You have successfully registered for:
        <strong>{event_name}</strong>
    </p>

    <p>
        Registration ID:
        <strong>{registration_id}</strong>
    </p>

    <p>
        Your QR Pass is attached to this email.
    </p>

    <p>
        You can also view it online:
    </p>

    <a href="{settings.frontend_url}/pass/{registration_id}">
        Open Event Pass
    </a>

    <br><br>

    <p>
        Please keep this QR code safe and show it at the event entrance.
    </p>
    """

    message = MessageSchema(
        subject="Event Registration Confirmation",
        recipients=[email],
        body=html,
        subtype="html",
        attachments=[
            qr_file
        ],
    )

    fm = FastMail(conf)

    await fm.send_message(message)

    print(
        f"Email sent to {email}"
    )


async def send_team_registration_email(
    email: str,
    member_name: str,
    event_name: str,
    team_name: str,
    team_id: int,
    qr_code_path: str,
):
    html = f"""
    <h2>Team Registration Successful 🎉</h2>

    <p>Hello {member_name},</p>

    <p>
        Your team has successfully registered for:
        <strong>{event_name}</strong>
    </p>

    <p>
        Team Name:
        <strong>{team_name}</strong>
    </p>

    <p>
        Team ID:
        <strong>{team_id}</strong>
    </p>

    <p>
        Your personal QR Pass is attached to this email.
    </p>

    <p>
        You can also view it online:
    </p>

    <a href="{settings.frontend_url}/team-pass/{team_id}">
        Open Team Pass
    </a>

    <br><br>

    <p>
        Please keep this QR code safe and show it at the event entrance.
    </p>
    """

    message = MessageSchema(
        subject="Team Registration Confirmation",
        recipients=[email],
        body=html,
        subtype="html",
        attachments=[
            qr_code_path
        ],
    )

    fm = FastMail(conf)

    await fm.send_message(message)

    print(
        f"Team email sent to {email}"
    )
