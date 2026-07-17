import asyncio
import threading
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from backend.app.services.email_service import (
    send_team_registration_email,
)
from sqlalchemy.orm import Session

from backend.app.core.errors import (
    NotFoundError,
    ValidationError,
)

from backend.app.models.event import Event
from backend.app.models.team import Team
from backend.app.models.team_member import TeamMember


def create_team_registration(
    db: Session,
    *,
    event_id: int,
    leader_user_id: int,
    team_name: str,
    members: list,
    payment_verified: bool = False,
):
    def _now_like(value: datetime) -> datetime:
        return datetime.now(value.tzinfo) if value.tzinfo else datetime.now()

    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .with_for_update()
        .one_or_none()
    )

    if not event:
        raise NotFoundError(
            "Event not found"
        )

    if not event.is_team_event:
        raise ValidationError(
            "This is not a team event"
        )

    if event.is_paid_event and not payment_verified:
        raise ValidationError(
            "Payment required for paid team events"
        )

    if _now_like(event.registration_deadline) >= event.registration_deadline:
        raise ValidationError(
            "Registration deadline has passed"
        )

    existing_team = (
        db.query(Team)
        .filter(
            Team.event_id == event_id,
            Team.leader_user_id == leader_user_id,
        )
        .first()
    )

    if existing_team:
        raise ValidationError(
            "You already registered a team for this event"
        )

    if (
        event.max_teams is not None
        and (
            db.query(Team)
            .filter(Team.event_id == event_id)
            .count()
        ) >= event.max_teams
    ):
        raise ValidationError(
            "Maximum teams reached"
        )

    member_count = len(members)

    if (
        member_count < event.min_team_size
        or member_count > event.max_team_size
    ):
        raise ValidationError(
            f"Team size must be between "
            f"{event.min_team_size} and "
            f"{event.max_team_size}"
        )

    team = Team(
        name=team_name,
        event_id=event_id,
        leader_user_id=leader_user_id,
    )

    db.add(team)
    db.flush()

    team_members = []

    for member in members:
        team_member = TeamMember(
            team_id=team.id,
            name=member.name,
            email=member.email,
            college=member.college,
            branch=member.branch,
            year=member.year,
            semester=member.semester,
            is_leader=member.is_leader,
        )

        db.add(team_member)
        team_members.append(team_member)

    db.flush()

    

    db.commit()
    db.refresh(team)

    for member in team.members:
        threading.Thread(
            target=lambda m=member: asyncio.run(
                send_team_registration_email(
    email=m.email,
    member_name=m.name,
    event_name=event.title,
    team_name=team.name,
    team_id=team.id,
    qr_code_path=None,
)
            ),
            daemon=True,
        ).start()

    return team


def get_my_team_registrations(
    db: Session,
    user_id: int,
):
    rows = db.execute(
        select(
            Team.id.label("team_id"),
            Team.name.label("team_name"),
            Team.event_id,
            Event.title.label("event_title"),
        )
        .join(Event, Team.event_id == Event.id)
        .where(Team.leader_user_id == user_id)
    ).all()

    return [
        {
            "team_id": row.team_id,
            "team_name": row.team_name,
            "event_id": row.event_id,
            "event_title": row.event_title,
        }
        for row in rows
    ]
def get_team_by_id(
    db: Session,
    team_id: int,
):
    team = (
        db.query(Team)
        .options(
            joinedload(Team.members),
            joinedload(Team.event).joinedload(Event.creator),
)
        .filter(
             Team.id == team_id
        )
        .first()
    )

    if not team:
        raise NotFoundError(
            "Team not found"
        )

    return team
