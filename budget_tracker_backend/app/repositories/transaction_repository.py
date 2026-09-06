from sqlalchemy.orm import Session
from app.models.transactions import Transaction
from datetime import date


class TransactionRepository:

    @staticmethod
    def create(
        db: Session,
        user_id: int,
        category_id: int | None,
        amount: float,
        type: str,
        description: str,
        date: date
    ) -> Transaction:
        transaction = Transaction(
            user_id=user_id,
            category_id=category_id,
            amount=amount,
            type=type,
            description=description,
            date=date
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction

    @staticmethod
    def get_all_by_user(db: Session, user_id: int) -> list[Transaction]:
        return db.query(Transaction).filter(Transaction.user_id == user_id).all()

    @staticmethod
    def get_by_id(db: Session, transaction_id: int) -> Transaction | None:
        return db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()

    @staticmethod
    def update(db: Session, transaction: Transaction, data: dict) -> Transaction:
        for key, value in data.items():
            if value is not None:
                setattr(transaction, key, value)
        db.commit()
        db.refresh(transaction)
        return transaction

    @staticmethod
    def delete(db: Session, transaction: Transaction) -> None:
        db.delete(transaction)
        db.commit()