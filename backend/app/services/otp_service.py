import random
import os

import sib_api_v3_sdk

from sib_api_v3_sdk.rest import ApiException


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
    configuration = (
        sib_api_v3_sdk.Configuration()
    )

    configuration.api_key[
        "api-key"
    ] = os.getenv(
        "BREVO_API_KEY"
    )

    api = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(
            configuration
        )
    )


    message = (
        sib_api_v3_sdk.SendSmtpEmail(
            sender={
                "email": os.getenv(
                    "MAIL_FROM"
                ),
                "name": "EventSphere",
            },
            to=[
                {
                    "email": email,
                }
            ],
            subject=subject,
            html_content=html,
        )
    )


    try:
        api.send_transac_email(
            message
        )

    except ApiException as e:
        print(e)



async def send_verification_otp(
    email: str,
    otp: str,
):

    send_email(
        email,
        "Verify Your Account",
        f"""
        <h2>Email Verification</h2>

        <h1>{otp}</h1>

        <p>
        Enter this code to verify your account.
        </p>
        """,
    )



async def send_reset_otp(
    email: str,
    otp: str,
):

    send_email(
        email,
        "Password Reset OTP",
        f"""
        <h2>Password Reset</h2>

        <h1>{otp}</h1>

        <p>
        Enter this code to reset your password.
        </p>
        """,
    )