from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.transaction_repository import TransactionRepository
from app.repositories.category_repository import CategoryRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.models.users import User


class TransactionService:

    @staticmethod
    def create(db: Session, data: TransactionCreate, current_user: User):
        if data.category_id is not None:
            category = CategoryRepository.get_by_id(db, data.category_id)
            if not category or category.user_id != current_user.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid category"
                )

        return TransactionRepository.create(
            db=db,
            user_id=current_user.user_id,
            category_id=data.category_id,
            amount=data.amount,
            type=data.type.value,
            description=data.description,
            date=data.date
        )

    @staticmethod
    def get_all(db: Session, current_user: User):
        return TransactionRepository.get_all_by_user(db, current_user.user_id)

    @staticmethod
    def get_by_id(db: Session, transaction_id: int, current_user: User):
        transaction = TransactionRepository.get_by_id(db, transaction_id)
        if not transaction or transaction.user_id != current_user.user_id:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction

    @staticmethod
    def update(db: Session, transaction_id: int, data: TransactionUpdate, current_user: User):
        transaction = TransactionService.get_by_id(db, transaction_id, current_user)

        update_data = data.model_dump(exclude_unset=True)

        if "category_id" in update_data and update_data["category_id"] is not None:
            category = CategoryRepository.get_by_id(db, update_data["category_id"])
            if not category or category.user_id != current_user.user_id:
                raise HTTPException(status_code=400, detail="Invalid category")

        if "type" in update_data and update_data["type"] is not None:
            update_data["type"] = update_data["type"].value

        return TransactionRepository.update(db, transaction, update_data)

    @staticmethod
    def delete(db: Session, transaction_id: int, current_user: User):
        transaction = TransactionService.get_by_id(db, transaction_id, current_user)
        TransactionRepository.delete(db, transaction)