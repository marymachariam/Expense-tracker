from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.transactions import router as transactions_router
from app.routers.budgets import router as budgets_router
from app.routers.dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "categories_router",
    "transactions_router",
    "budgets_router",
    "dashboard_router",
]