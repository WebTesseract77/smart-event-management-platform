from sqlalchemy import (
    Boolean,
    ForeignKey,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from backend.app.database.base import Base


class TeamMember(Base):
    __tablename__ = "team_members"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    team_id: Mapped[int] = mapped_column(
        ForeignKey(
            "teams.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    qr_code_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    college: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    branch: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    year: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    semester: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    is_leader: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    team = relationship(
        "Team",
        back_populates="members",
    )
