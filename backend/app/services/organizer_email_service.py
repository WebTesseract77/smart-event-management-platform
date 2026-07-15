import html
import logging
import os
from datetime import datetime

from backend.app.services.otp_service import send_email

logger = logging.getLogger(__name__)


def _email_layout(content: str) -> str:
    return f"""
    <div style="background:#f5f7f6;padding:32px 16px;font-family:Arial,sans-serif;color:#1f2933;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
        <h2 style="margin:0 0 24px;color:#0f4d3f;">EventSphere</h2>
        {content}
        <hr style="border:0;border-top:1px solid #e5e7eb;margin:32px 0 20px;">
        <p style="margin:0;color:#6b7280;font-size:14px;">
          Thank you for choosing <strong>EventSphere</strong>.
        </p>
      </div>
    </div>
    """


def _send_notification(email: str, subject: str, content: str) -> None:
    try:
        send_email(
            email=email,
            subject=subject,
            html=_email_layout(content),
        )
    except Exception:
        logger.exception("Failed to send organizer notification to %s", email)


async def send_organizer_application_received_email(
    email: str,
    name: str,
) -> None:
    safe_name = html.escape(name)
    _send_notification(
        email,
        "Organizer Application Received",
        f"""
        <p>Hello <strong>{safe_name}</strong>,</p>
        <p>Your organizer application has been successfully submitted.</p>
        <p><strong>Status:</strong> Pending Review</p>
        <p><strong>Estimated review time:</strong> 1-3 business days.</p>
        <p>You will receive another email once an administrator reviews your application.</p>
        """,
    )


async def send_organizer_approved_email(
    email: str,
    name: str,
) -> None:
    safe_name = html.escape(name)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    _send_notification(
        email,
        "Congratulations! You're now an Organizer 🎉",
        f"""
        <p>Hello <strong>{safe_name}</strong>,</p>
        <p>Your organizer application has been approved.</p>
        <p>You now have access to:</p>
        <ul>
          <li>Create Events</li>
          <li>Manage Registrations</li>
          <li>View Event Analytics</li>
          <li>Generate QR Passes</li>
        </ul>
        <p style="margin-top:28px;">
          <a href="{frontend_url}/create-event" style="display:inline-block;background:#0f4d3f;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;">
            Open Organizer Dashboard
          </a>
        </p>
        """,
    )


async def send_organizer_rejected_email(
    email: str,
    name: str,
    admin_remark: str,
    cooldown_until: datetime | None = None,
) -> None:
    safe_name = html.escape(name)
    safe_remark = html.escape(admin_remark)
    cooldown_message = ""

    if cooldown_until:
        cooldown_message = (
            f"<p><strong>Cooldown period:</strong> You may apply again after "
            f"{cooldown_until.date()}.</p>"
        )

    _send_notification(
        email,
        "Organizer Application Update",
        f"""
        <p>Hello <strong>{safe_name}</strong>,</p>
        <p>Unfortunately your application was not approved.</p>
        <p><strong>Admin Remark:</strong> {safe_remark}</p>
        {cooldown_message}
        <p>You may submit another application after the cooldown period.</p>
        """,
    )


async def send_organizer_revoked_email(
    email: str,
    name: str,
    admin_remark: str | None = None,
) -> None:
    safe_name = html.escape(name)
    remark_message = ""

    if admin_remark:
        remark_message = (
            f"<p><strong>Admin Remark:</strong> "
            f"{html.escape(admin_remark)}</p>"
        )

    _send_notification(
        email,
        "Organizer Access Revoked",
        f"""
        <p>Hello <strong>{safe_name}</strong>,</p>
        <p>Your organizer privileges have been removed by an administrator.</p>
        {remark_message}
        <p><strong>Contact:</strong> admin.eventsphere@gmail.com</p>
        """,
    )
