from datetime import datetime
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base
from backend.app.core.roles import ROLE_USER


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default=ROLE_USER,
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    verification_otp: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    verification_otp_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    reset_otp: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )

    reset_otp_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_events = relationship(
        "Event",
        back_populates="creator",
        cascade="all, delete-orphan",
    )

    registrations = relationship(
        "Registration",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    attendances = relationship(
        "Attendance",
        cascade="all, delete-orphan",
    )

    organizer_requests = relationship(
        "OrganizerRequest",
        foreign_keys="OrganizerRequest.user_id",
        cascade="all, delete-orphan",
    )