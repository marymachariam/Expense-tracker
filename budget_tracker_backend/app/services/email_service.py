import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import get_settings

settings = get_settings()


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends OTP to the user's email using Brevo SMTP.
    Returns True if sent successfully, False otherwise.
    """
    try:
        msg = MIMEMultipart()
        msg["From"] = settings.MAIL_FROM
        msg["To"] = to_email
        msg["Subject"] = "Your Verification Code - Budget Tracker"

        body = f"""
Hello,

Your verification code is:

    {otp_code}

This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.

If you did not request this code, please ignore this email.

— Smart Budget Tracker
        """

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.send_message(msg)

        print(f"[EMAIL] OTP sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send OTP to {to_email}: {e}")
        return False


def send_reset_password_email(to_email: str, reset_token: str) -> bool:
    """
    Sends a password reset link to the user's email.
    Returns True if sent successfully, False otherwise.
    """
    try:
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

        msg = MIMEMultipart()
        msg["From"] = settings.MAIL_FROM
        msg["To"] = to_email
        msg["Subject"] = "Reset Your Password - Budget Tracker"

        body = f"""
Hello,

We received a request to reset your password.

Click the link below to set a new password:

    {reset_link}

This link will expire in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.

If you did not request this, please ignore this email — your password will remain unchanged.

— Smart Budget Tracker
        """

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.send_message(msg)

        print(f"[EMAIL] Reset link sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send reset link to {to_email}: {e}")
        return False