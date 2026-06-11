import random

from fastapi_mail import (
    FastMail,
    MessageSchema,
)

from backend.app.services.email_service import conf


def generate_otp() -> str:
    return str(
        random.randint(
            100000,
            999999,
        )
    )


async def send_verification_otp(
    email: str,
    otp: str,
):
    html = f"""
    <h2>Email Verification</h2>

    <p>Your verification code is:</p>

    <h1>{otp}</h1>

    <p>
        Enter this code to verify
        your account.
    </p>
    """

    message = MessageSchema(
        subject="Verify Your Account",
        recipients=[email],
        body=html,
        subtype="html",
    )

    fm = FastMail(conf)

    await fm.send_message(message)


async def send_reset_otp(
    email: str,
    otp: str,
):
    html = f"""
    <h2>Password Reset</h2>

    <p>Your password reset code is:</p>

    <h1>{otp}</h1>

    <p>
        Enter this code to reset
        your password.
    </p>
    """

    message = MessageSchema(
        subject="Password Reset OTP",
        recipients=[email],
        body=html,
        subtype="html",
    )

    fm = FastMail(conf)

    await fm.send_message(message)