from datetime import datetime
from sqlalchemy.orm import Session

from app.models.users import User


class UserRepository:

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.user_id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> User | None:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def create(db: Session, username: str, email: str, hashed_password: str) -> User:
        user = User(username=username, email=email, password=hashed_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def set_otp(db: Session, user: User, otp_code: str, expires_at: datetime) -> None:
        user.otp_code = otp_code
        user.otp_expires_at = expires_at
        db.commit()
        db.refresh(user)

    @staticmethod
    def verify_user(db: Session, user: User) -> None:
        user.is_verified = True
        user.otp_code = None
        user.otp_expires_at = None
        db.commit()
        db.refresh(user)

    @staticmethod
    def set_reset_token(db: Session, user: User, token: str, expires_at: datetime) -> None:
        user.reset_token = token
        user.reset_token_expires_at = expires_at
        db.commit()
        db.refresh(user)

    @staticmethod
    def get_by_reset_token(db: Session, token: str) -> User | None:
        return db.query(User).filter(User.reset_token == token).first()

    @staticmethod
    def reset_password(db: Session, user: User, hashed_password: str) -> None:
        user.password = hashed_password
        user.reset_token = None
        user.reset_token_expires_at = None
        db.commit()
        db.refresh(user)

    # ---- New ----

    @staticmethod
    def update_preferences(db: Session, user: User, currency: str, default_budget_month: int | None) -> User:
        user.currency = currency
        user.default_budget_month = default_budget_month
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_password(db: Session, user: User, hashed_password: str) -> None:
        user.password = hashed_password
        db.commit()
        db.refresh(user)