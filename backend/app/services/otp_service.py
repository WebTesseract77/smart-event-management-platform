import random
import os

from mailjet_rest import Client


def generate_otp() -> str:
    return str(
        random.randint(
            100000,
            999999,
        )
    )


def send_email(
    email: str,
    subject: str,
    html: str,
):

    api_key = os.getenv(
        "MAILJET_API_KEY"
    )

    secret_key = os.getenv(
        "MAILJET_SECRET_KEY"
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
                    "Email": os.getenv(
                        "MAIL_FROM"
                    ),
                    "Name": "EventSphere",
                },

                "To": [
                    {
                        "Email": email,
                    }
                ],

                "Subject": subject,

                "HTMLPart": html,
            }
        ]
    }


    result = mailjet.send.create(
        data=data
    )


    print(
        "MAILJET STATUS:",
        result.status_code,
        flush=True,
    )


    print(
        result.json(),
        flush=True,
    )





async def send_verification_otp(
    email: str,
    otp: str,
):

    send_email(
        email,
        "Verify Your EventSphere Account",
        f"""
        <h2>EventSphere Verification</h2>

        <p>Your verification code:</p>

        <h1>{otp}</h1>

        <p>Enter this OTP to activate your account.</p>
        """,
    )





async def send_reset_otp(
    email: str,
    otp: str,
):

    send_email(
        email,
        "EventSphere Password Reset OTP",
        f"""
        <h2>Password Reset</h2>

        <p>Your reset OTP:</p>

        <h1>{otp}</h1>

        <p>Ignore this email if this wasn't you.</p>
        """,
    )