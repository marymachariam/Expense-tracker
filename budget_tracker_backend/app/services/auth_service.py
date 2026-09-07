from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_otp,
    get_otp_expiry,
    generate_reset_token,
    get_reset_token_expiry,
)
from app.schemas.user import UserCreate, UserLogin
from app.services.email_service import send_otp_email, send_reset_password_email


class AuthService:

    @staticmethod
    def register(db: Session, data: UserCreate):
        if UserRepository.get_by_email(db, data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        if UserRepository.get_by_username(db, data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        hashed = hash_password(data.password)
        user = UserRepository.create(db, data.username, data.email, hashed)

        otp = generate_otp()
        expires = get_otp_expiry()
        UserRepository.set_otp(db, user, otp, expires)

        sent = send_otp_email(user.email, otp)
        if not sent:
            print(f"[OTP FALLBACK] {user.email} → {otp}")

        return user

    @staticmethod
    def login(db: Session, data: UserLogin):
        user = UserRepository.get_by_email(db, data.email)

        if not user or not verify_password(data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email first"
            )

        access_token = create_access_token(
            data={"user_id": user.user_id, "username": user.username}
        )
        refresh_token = create_refresh_token(
            data={"user_id": user.user_id}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user.user_id,
            "username": user.username
        }

    @staticmethod
    def verify_otp(db: Session, email: str, otp_code: str):
        user = UserRepository.get_by_email(db, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.is_verified:
            raise HTTPException(status_code=400, detail="User already verified")

        if user.otp_code != otp_code:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        otp_expires_at = user.otp_expires_at
        if otp_expires_at and otp_expires_at.tzinfo is None:
            otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)

        if not otp_expires_at or otp_expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="OTP has expired")

        UserRepository.verify_user(db, user)
        return {"message": "Email verified successfully"}

    @staticmethod
    def resend_otp(db: Session, email: str):
        user = UserRepository.get_by_email(db, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.is_verified:
            raise HTTPException(status_code=400, detail="User already verified")

        otp = generate_otp()
        expires = get_otp_expiry()
        UserRepository.set_otp(db, user, otp, expires)

        sent = send_otp_email(user.email, otp)
        if not sent:
            print(f"[OTP FALLBACK] {user.email} → {otp}")

        return {"message": "OTP resent successfully"}

    @staticmethod
    def forgot_password(db: Session, email: str):
        user = UserRepository.get_by_email(db, email)

        # Always return the same message (security best practice)
        generic_response = {
            "message": "If an account with that email exists, a reset link has been sent."
        }

        if not user:
            return generic_response

        token = generate_reset_token()
        expires = get_reset_token_expiry()
        UserRepository.set_reset_token(db, user, token, expires)

        sent = send_reset_password_email(user.email, token)
        if not sent:
            print(f"[RESET TOKEN FALLBACK] {user.email} → {token}")

        return generic_response

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str):
        user = UserRepository.get_by_reset_token(db, token)

        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        expires_at = user.reset_token_expires_at
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if not expires_at or expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        hashed = hash_password(new_password)
        UserRepository.reset_password(db, user, hashed)

        return {"message": "Password reset successfully"}