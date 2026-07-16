from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    UniqueConstraint,
    String,
    Float,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from backend.app.database.base import Base


class Registration(Base):
    __tablename__ = "registrations"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "event_id",
            name="uq_user_event_registration",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    event_id: Mapped[int] = mapped_column(
        ForeignKey(
            "events.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    payment_status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
    )

    payment_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    amount_paid: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
    )

    # NEW
    qr_code_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="registrations",
    )

    event = relationship(
        "Event",
        back_populates="registrations",
    )