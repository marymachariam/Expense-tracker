import requests
from app.core.config import get_settings

settings = get_settings()


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends OTP using Brevo HTTP API (works on Render).
    """
    try:
        url = "https://api.brevo.com/v3/smtp/email"

        headers = {
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json"
        }

        payload = {
            "sender": {
                "name": "Smart Budget Tracker",
                "email": settings.MAIL_FROM
            },
            "to": [
                {"email": to_email}
            ],
            "subject": "Your Verification Code - Budget Tracker",
            "htmlContent": f"""
                <html>
                    <body>
                        <p>Hello,</p>
                        <p>Your verification code is:</p>
                        <h2 style="letter-spacing: 4px;">{otp_code}</h2>
                        <p>This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.</p>
                        <p>If you did not request this code, please ignore this email.</p>
                        <br>
                        <p>— Smart Budget Tracker</p>
                    </body>
                </html>
            """
        }

        response = requests.post(url, json=payload, headers=headers, timeout=15)

        if response.status_code in [200, 201]:
            print(f"[EMAIL] OTP sent successfully to {to_email}")
            return True
        else:
            print(f"[EMAIL ERROR] Brevo API error: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send OTP to {to_email}: {e}")
        return False


def send_reset_password_email(to_email: str, reset_token: str) -> bool:
    try:
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        url = "https://api.brevo.com/v3/smtp/email"

        headers = {
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json"
        }

        payload = {
            "sender": {
                "name": "Smart Budget Tracker",
                "email": settings.MAIL_FROM
            },
            "to": [{"email": to_email}],
            "subject": "Reset Your Password - Budget Tracker",
            "htmlContent": f"""
                <html>
                    <body>
                        <p>Hello,</p>
                        <p>We received a request to reset your password.</p>
                        <p>Click the link below to set a new password:</p>
                        <p><a href="{reset_link}">{reset_link}</a></p>
                        <p>If you did not request this, please ignore this email.</p>
                        <br>
                        <p>— Smart Budget Tracker</p>
                    </body>
                </html>
            """
        }

        response = requests.post(url, json=payload, headers=headers, timeout=15)

        if response.status_code in [200, 201]:
            print(f"[EMAIL] Reset link sent successfully to {to_email}")
            return True
        else:
            print(f"[EMAIL ERROR] Brevo API error: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send reset link to {to_email}: {e}")
        return False