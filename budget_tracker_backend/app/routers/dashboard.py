from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from app.core.security import get_current_user
from app.models.users import User
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DashboardService.get_summary(db, current_user)


@router.get("/category-summary")
def category_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DashboardService.get_category_summary(db, current_user)


@router.get("/monthly-spending")
def monthly_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DashboardService.get_monthly_spending(db, current_user)


@router.get("/budget-vs-spending")
def budget_vs_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DashboardService.get_budget_vs_spending(db, current_user)


@router.get("/alerts")
def spending_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DashboardService.get_alerts(db, current_user)


@router.get("/prediction")
def end_of_month_prediction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DashboardService.get_prediction(db, current_user)