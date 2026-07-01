from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Text,
    String,
    Float,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from backend.app.database.base import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    capacity: Mapped[int] = mapped_column(
        default=100,
        nullable=False,
    )

    # NEW TEAM EVENT FIELDS
    is_team_event: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    min_team_size: Mapped[int] = mapped_column(
        default=1,
        nullable=False,
    )

    max_team_size: Mapped[int] = mapped_column(
        default=1,
        nullable=False,
    )
    max_teams: Mapped[int | None] = mapped_column(
    nullable=True,
)  
    is_paid_event: Mapped[bool] = mapped_column(
    default=False,
    nullable=False,
)

    registration_fee: Mapped[float] = mapped_column(
      Float,
      default=0,
      nullable=False,
)
   
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    registration_deadline: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    nullable=False,
)

    created_by: Mapped[int | None] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )

    creator = relationship(
        "User",
        back_populates="created_events",
    )

    registrations = relationship(
        "Registration",
        back_populates="event",
        cascade="all, delete-orphan",
    )

    attendances = relationship(
        "Attendance",
        cascade="all, delete-orphan",
    )
    teams = relationship(
        "Team",
        back_populates="event",
        cascade="all, delete-orphan",
    )
