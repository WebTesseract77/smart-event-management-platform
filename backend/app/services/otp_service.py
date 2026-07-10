import random
import os

import resend


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

    resend.api_key = os.getenv(
        "RESEND_API_KEY"
    )


    try:

        response = resend.Emails.send(
            {
                "from": f"EventSphere <{os.getenv('MAIL_FROM')}>",

                "to": [
                    email,
                ],

                "subject": subject,

                "html": html,
            }
        )


        print(
            "RESEND EMAIL SENT:",
            response,
            flush=True,
        )


    except Exception as error:

        print(
            "RESEND FAILED:",
            error,
            flush=True,
        )





async def send_verification_otp(
    email: str,
    otp: str,
):

    send_email(
        email=email,

        subject="Verify Your EventSphere Account",

        html=f"""
        <div style="font-family:Arial">

        <h2>
        EventSphere Verification
        </h2>


        <p>Your verification code:</p>


        <h1>
        {otp}
        </h1>


        <p>
        Enter this OTP to activate your account.
        </p>

        </div>
        """,
    )





async def send_reset_otp(
    email: str,
    otp: str,
):

    send_email(
        email=email,

        subject="EventSphere Password Reset",

        html=f"""
        <div style="font-family:Arial">

        <h2>
        Password Reset
        </h2>


        <p>Your reset code:</p>


        <h1>
        {otp}
        </h1>


        <p>
        Ignore if this wasn't you.
        </p>

        </div>
        """,
    )