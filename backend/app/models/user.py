from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user", nullable=False)

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