from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.users import User
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password
from app.schemas.user import PreferencesUpdate, ChangePasswordRequest


class UserService:

    @staticmethod
    def get_profile(user: User) -> User:
        return user

    @staticmethod
    def update_preferences(db: Session, user: User, data: PreferencesUpdate) -> User:
        return UserRepository.update_preferences(
            db, user, currency=data.currency, default_budget_month=data.default_budget_month
        )

    @staticmethod
    def change_password(db: Session, user: User, data: ChangePasswordRequest) -> dict:
        if not verify_password(data.current_password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
            )

        hashed = hash_password(data.new_password)
        UserRepository.update_password(db, user, hashed)
        return {"message": "Password changed successfully"}