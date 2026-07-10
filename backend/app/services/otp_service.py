import random
import os

import sib_api_v3_sdk


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
    print(
        "========== BREVO DEBUG START =========="
    )

    api_key = os.getenv(
        "BREVO_API_KEY"
    )

    sender_email = os.getenv(
        "MAIL_FROM"
    )


    print(
        "API KEY EXISTS:",
        bool(api_key),
    )

    print(
        "MAIL FROM:",
        sender_email,
    )

    print(
        "SEND TO:",
        email,
    )


    if not api_key:
        print(
            "BREVO_API_KEY missing"
        )

        return


    if not sender_email:
        print(
            "MAIL_FROM missing"
        )

        return


    configuration = (
        sib_api_v3_sdk.Configuration()
    )


    configuration.api_key[
        "api-key"
    ] = api_key


    api_client = (
        sib_api_v3_sdk.ApiClient(
            configuration
        )
    )


    api = (
        sib_api_v3_sdk.TransactionalEmailsApi(
            api_client
        )
    )


    message = (
        sib_api_v3_sdk.SendSmtpEmail(
            sender={
                "name": "EventSphere",
                "email": sender_email,
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

        response = (
            api.send_transac_email(
                message
            )
        )


        print(
            "BREVO EMAIL SENT SUCCESSFULLY"
        )

        print(
            response
        )


    except Exception as error:

        print(
            "BREVO EMAIL FAILED"
        )

        print(
            error
        )


    print(
        "========== BREVO DEBUG END =========="
    )





async def send_verification_otp(
    email: str,
    otp: str,
):

    html = f"""
    <div style="font-family:Arial">

        <h2>
            EventSphere Email Verification
        </h2>


        <p>
            Your verification code is:
        </p>


        <h1>
            {otp}
        </h1>


        <p>
            This code is required to activate your account.
        </p>

    </div>
    """


    send_email(
        email=email,
        subject="Verify Your EventSphere Account",
        html=html,
    )





async def send_reset_otp(
    email: str,
    otp: str,
):

    html = f"""
    <div style="font-family:Arial">

        <h2>
            EventSphere Password Reset
        </h2>


        <p>
            Your password reset OTP is:
        </p>


        <h1>
            {otp}
        </h1>


        <p>
            Ignore this email if you did not request a reset.
        </p>

    </div>
    """


    send_email(
        email=email,
        subject="EventSphere Password Reset OTP",
        html=html,
    )