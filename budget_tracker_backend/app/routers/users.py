from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from app.core.security import get_current_user
from app.models.users import User
from app.schemas.user import UserResponse, PreferencesUpdate, ChangePasswordRequest
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserService.get_profile(current_user)


@router.patch("/me/preferences", response_model=UserResponse)
def update_preferences(
    data: PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.update_preferences(db, current_user, data)


@router.post("/me/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.change_password(db, current_user, data)