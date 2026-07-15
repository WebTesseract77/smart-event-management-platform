import os
import random

from mailjet_rest import Client


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def send_email(
    email: str,
    subject: str,
    html: str,
):
    api_key = os.getenv("MAILJET_API_KEY")
    secret_key = os.getenv("MAILJET_SECRET_KEY")

    mail_from = os.getenv(
        "MAIL_FROM",
        "admin.eventsphere@gmail.com",
    )

    mailjet = Client(
        auth=(
            api_key,
            secret_key,
        ),
        version="v3.1",
    )

    data = {
        "Messages": [
            {
                "From": {
                    "Email": mail_from,
                    "Name": "EventSphere Team",
                },

                "ReplyTo": {
                    "Email": mail_from,
                    "Name": "EventSphere Support",
                },

                "To": [
                    {
                        "Email": email,
                    }
                ],

                "Subject": subject,

                "TextPart": (
                    "This is an automated email from EventSphere.\n\n"
                    "If you cannot view the HTML version of this email, "
                    "please open it using a modern email client."
                ),

                "HTMLPart": html,
            }
        ]
    }

    try:
        result = mailjet.send.create(data=data)

        print(
            "MAILJET STATUS:",
            result.status_code,
            flush=True,
        )

        print(
            result.json(),
            flush=True,
        )

    except Exception as exc:
        print(
            f"Mailjet send failed: {exc}",
            flush=True,
        )
        raise


async def send_verification_otp(
    email: str,
    otp: str,
):
    send_email(
        email=email,
        subject="Verify Your EventSphere Account",
        html=f"""
        <h2>EventSphere Verification</h2>

        <p>Your verification code is:</p>

        <h1>{otp}</h1>

        <p>
            Enter this OTP to activate your EventSphere account.
        </p>

        <hr>

        <p>
            This is an automated email from
            <strong>EventSphere</strong>.
        </p>
        """,
    )


async def send_reset_otp(
    email: str,
    otp: str,
):
    send_email(
        email=email,
        subject="EventSphere Password Reset OTP",
        html=f"""
        <h2>Password Reset</h2>

        <p>Your password reset OTP is:</p>

        <h1>{otp}</h1>

        <p>
            If you did not request a password reset,
            you can safely ignore this email.
        </p>

        <hr>

        <p>
            This is an automated email from
            <strong>EventSphere</strong>.
        </p>
        """,
    )