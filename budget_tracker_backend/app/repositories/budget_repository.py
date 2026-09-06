from sqlalchemy.orm import Session
from app.models.budget import Budget


class BudgetRepository:

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        category_id: int,
        amount: float,
        month: int,
        year: int
    ) -> Budget:
        budget = Budget(
            user_id=user_id,
            category_id=category_id,
            amount=amount,
            month=month,
            year=year
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)
        return budget

    @staticmethod
    def get_all_by_user(db: Session, user_id: int) -> list[Budget]:
        return db.query(Budget).filter(Budget.user_id == user_id).all()

    @staticmethod
    def get_by_id(db: Session, budget_id: int) -> Budget | None:
        return db.query(Budget).filter(Budget.budget_id == budget_id).first()

    @staticmethod
    def update(db: Session, budget: Budget, data: dict) -> Budget:
        for key, value in data.items():
            if value is not None:
                setattr(budget, key, value)
        db.commit()
        db.refresh(budget)
        return budget

    @staticmethod
    def delete(db: Session, budget: Budget) -> None:
        db.delete(budget)
        db.commit()