from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.budget_repository import BudgetRepository
from app.repositories.category_repository import CategoryRepository
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.models.users import User


class BudgetService:

    @staticmethod
    def create(db: Session, data: BudgetCreate, current_user: User):
        category = CategoryRepository.get_by_id(db, data.category_id)
        if not category or category.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category"
            )

        return BudgetRepository.create(
            db=db,
            user_id=current_user.user_id,
            category_id=data.category_id,
            amount=data.amount,
            month=data.month,
            year=data.year
        )

    @staticmethod
    def get_all(db: Session, current_user: User):
        return BudgetRepository.get_all_by_user(db, current_user.user_id)

    @staticmethod
    def get_by_id(db: Session, budget_id: int, current_user: User):
        budget = BudgetRepository.get_by_id(db, budget_id)
        if not budget or budget.user_id != current_user.user_id:
            raise HTTPException(status_code=404, detail="Budget not found")
        return budget

    @staticmethod
    def update(db: Session, budget_id: int, data: BudgetUpdate, current_user: User):
        budget = BudgetService.get_by_id(db, budget_id, current_user)

        update_data = data.model_dump(exclude_unset=True)

        if "category_id" in update_data and update_data["category_id"] is not None:
            category = CategoryRepository.get_by_id(db, update_data["category_id"])
            if not category or category.user_id != current_user.user_id:
                raise HTTPException(status_code=400, detail="Invalid category")

        return BudgetRepository.update(db, budget, update_data)

    @staticmethod
    def delete(db: Session, budget_id: int, current_user: User):
        budget = BudgetService.get_by_id(db, budget_id, current_user)
        BudgetRepository.delete(db, budget)