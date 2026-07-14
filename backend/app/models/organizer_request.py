from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from backend.app.database.base import Base


class OrganizerRequest(Base):
    __tablename__ = "organizer_requests"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    organization: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    experience: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    event_categories: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    events_per_year: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    portfolio_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
    )

    admin_remark: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    reviewed_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    applicant = relationship(
        "User",
        foreign_keys=[user_id],
    )

    reviewer = relationship(
        "User",
        foreign_keys=[reviewed_by],
    )