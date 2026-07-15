from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.core.dependencies import get_current_admin, get_db
from backend.app.models.user import User
from backend.app.schemas.admin_analytics import AdminAnalyticsRead
from backend.app.services.admin_analytics_service import get_admin_analytics

router = APIRouter(prefix="/admin", tags=["Admin Analytics"])


@router.get("/analytics", response_model=AdminAnalyticsRead)
def analytics(
    period: str = Query("30d"),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    now = datetime.utcnow()
    ranges = {"today": timedelta(days=1), "7d": timedelta(days=7), "30d": timedelta(days=30), "90d": timedelta(days=90), "year": timedelta(days=365)}
    if period != "custom":
        start_date = now - ranges.get(period, ranges["30d"])
        end_date = now
    return get_admin_analytics(db, start_date, end_date)
