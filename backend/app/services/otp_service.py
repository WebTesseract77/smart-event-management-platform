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
    <div style="font-family:Arial">

    <h2>
    EventSphere Verification
    </h2>

    <p>Your verification OTP:</p>

    <h1>{otp}</h1>

    <p>
    Enter this code to verify your account.
    </p>

    </div>
    """


    message = MessageSchema(
        subject="Verify Your EventSphere Account",
        recipients=[
            email,
        ],
        body=html,
        subtype="html",
    )


    fm = FastMail(conf)


    await fm.send_message(
        message
    )


    print(
        "Verification OTP sent:",
        email,
        flush=True,
    )





async def send_reset_otp(
    email: str,
    otp: str,
):

    html = f"""
    <div style="font-family:Arial">

    <h2>
    Password Reset
    </h2>


    <p>Your reset OTP:</p>


    <h1>{otp}</h1>


    <p>
    Ignore this email if you did not request it.
    </p>


    </div>
    """


    message = MessageSchema(
        subject="EventSphere Password Reset OTP",
        recipients=[
            email,
        ],
        body=html,
        subtype="html",
    )


    fm = FastMail(conf)


    await fm.send_message(
        message
    )


    print(
        "Reset OTP sent:",
        email,
        flush=True,
    )