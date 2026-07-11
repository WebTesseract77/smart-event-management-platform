import os

from backend.app.services.otp_service import send_email
from backend.app.services.qr_service import generate_qr


async def send_registration_email(
    email: str,
    participant_name: str,
    event_name: str,
    registration_id: int,
):
    # Generate QR so the pass exists on the server
    generate_qr(registration_id)

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000",
    )

    html = f"""
    <h2>Registration Successful 🎉</h2>

    <p>Hello <strong>{participant_name}</strong>,</p>

    <p>
        You have successfully registered for
        <strong>{event_name}</strong>.
    </p>

    <p>
        <strong>Registration ID:</strong>
        {registration_id}
    </p>

    <p>
        Your event pass is now available online.
    </p>

    <p>
        <a href="{frontend_url}/pass/{registration_id}">
            View Your Event Pass
        </a>
    </p>

    <br>

    <p>
        Please keep your QR Pass safe and present it at the event entrance.
    </p>

    <hr>

    <p>
        Thank you for choosing <strong>EventSphere</strong>.
    </p>
    """

    send_email(
        email=email,
        subject="🎉 Event Registration Confirmation",
        html=html,
    )

    print(f"Registration email sent to {email}")


async def send_team_registration_email(
    email: str,
    member_name: str,
    event_name: str,
    team_name: str,
    team_id: int,
    qr_code_path: str,
):
    # Generate QR already handled elsewhere if needed.
    # qr_code_path kept only for compatibility.

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000",
    )

    html = f"""
    <h2>Team Registration Successful 🎉</h2>

    <p>Hello <strong>{member_name}</strong>,</p>

    <p>
        Your team has successfully registered for
        <strong>{event_name}</strong>.
    </p>

    <p>
        <strong>Team Name:</strong>
        {team_name}
    </p>

    <p>
        <strong>Team ID:</strong>
        {team_id}
    </p>

    <p>
        Your team pass is available online.
    </p>

    <p>
        <a href="{frontend_url}/team-pass/{team_id}">
            View Team Pass
        </a>
    </p>

    <br>

    <p>
        Please present your QR Pass at the event entrance.
    </p>

    <hr>

    <p>
        Thank you for choosing <strong>EventSphere</strong>.
    </p>
    """

    send_email(
        email=email,
        subject="🎉 Team Registration Confirmation",
        html=html,
    )

    print(f"Team registration email sent to {email}")