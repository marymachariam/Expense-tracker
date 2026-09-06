markdown
# Smart Budget Tracker — Backend API

A FastAPI backend for a personal budget-tracking application, with
JWT-based authentication, email OTP verification, category-based budgeting,
transaction tracking, and a spending dashboard.

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Auth:** JWT (access + refresh tokens) via `python-jose`, password hashing via `passlib` (bcrypt)
- **Validation:** Pydantic
- **Server:** Uvicorn

## Features

- **Authentication**
  - Registration with email OTP verification
  - Login (JWT access + refresh tokens)
  - Resend OTP
  - Forgot password / reset password via emailed token
  - Change password (while logged in)
- **User profile & preferences**
  - View profile (`/users/me`)
  - Update preferences: currency, default budget month
- **Categories** — full CRUD, scoped to the logged-in user
- **Transactions** — full CRUD, scoped to the logged-in user, linked to a category
- **Budgets** — full CRUD, scoped to the logged-in user, per category/month/year
- **Dashboard** — income/expense summary, category breakdown, monthly spending trend,
  budget vs. actual spending, top expenses, recent transactions, and spending alerts

## Project Structure

.
├── main.py # App entrypoint, router registration, CORS, table creation
├── database.py # SQLAlchemy engine, session factory, Base, get_db dependency
├── alembic/
│ ├── env.py
│ └── versions/ # Migration files — tracked in git
├── alembic.ini
├── app/
│ ├── core/
│ │ ├── config.py # Settings (env-based)
│ │ └── security.py # Password hashing, JWT create/verify, get_current_user
│ ├── models/ # SQLAlchemy models (User, Category, Transaction, Budget)
│ ├── schemas/ # Pydantic request/response schemas
│ ├── repositories/ # Data access layer — no business logic
│ ├── services/ # Business logic layer — auth rules, ownership checks
│ └── routers/ # FastAPI routers — thin HTTP layer only
├── requirements.txt
└── .env # Local environment variables (not committed)


**Layering convention:** routers only handle HTTP concerns (request in, response out).
Services hold business rules and validation. Repositories hold raw database queries.
Nothing in a router talks to the database directly.

## Prerequisites

- Python 3.10+
- PostgreSQL running locally or accessible remotely
- An SMTP provider or email service (for OTP / password reset emails) — or rely on the
  console fallback (see below) while developing

## Setup

1. **Clone and enter the project**
```bash
   git clone <your-repo-url>
   cd budget_tracker_backend
```

2. **Create and activate a virtual environment**
```bash
   python -m venv env
   source env/bin/activate        # Windows: env\Scripts\activate
```

3. **Install dependencies**
```bash
   pip install -r requirements.txt
```

4. **Create your `.env` file**
```bash
   cp .env.example .env   # if you have one; otherwise create manually
```
   Fill in the values described below.

5. **Create the database**
```bash
   createdb budget_tracker
```

6. **Run migrations**
```bash
   alembic upgrade head
```

7. **Start the server**
```bash
   uvicorn main:app --reload
```
   The API will be available at `http://127.0.0.1:8000`, with interactive docs at
   `http://127.0.0.1:8000/docs`.

## Environment Variables

Create a `.env` file in the project root with the following (adjust to match
whatever your `app/core/config.py` actually reads):

```env
APP_NAME=Smart Budget Tracker

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/budget_tracker

# JWT
SECRET_KEY=replace-with-a-long-random-value
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# OTP / password reset
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=10
RESET_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]

# Email (if using a real SMTP provider)
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
```

Generate a strong `SECRET_KEY` with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Never commit `.env`.** It's already covered by `.gitignore`.

## Database Migrations (Alembic)

This project uses Alembic for all schema changes — `Base.metadata.create_all()`
only creates tables that don't exist yet; it will **not** alter existing tables.
Any change to a model must go through a migration.

Create a new migration after changing a model:
```bash
alembic revision --autogenerate -m "describe the change"
```

Always open the generated file in `alembic/versions/` and confirm the
`upgrade()`/`downgrade()` functions actually reflect the intended change —
autogenerate doesn't catch everything (e.g. column renames, some constraint changes).

Apply migrations:
```bash
alembic upgrade head
```

Roll back the last migration:
```bash
alembic downgrade -1
```

## Authentication Flow

1. `POST /auth/register` — creates the user (unverified) and emails an OTP.
2. `POST /auth/verify-otp` — verifies the email with the OTP code.
3. `POST /auth/resend-otp` — resends a fresh OTP if needed.
4. `POST /auth/login` — returns `access_token`, `refresh_token`, `user_id`, `username`.
   Login is blocked until the email is verified.
5. Send `Authorization: Bearer <access_token>` on every protected request.
6. `POST /auth/forgot-password` — always returns a generic success message
   (doesn't reveal whether the email exists), emails a reset token if it does.
7. `POST /auth/reset-password` — resets the password using the emailed token.
8. `POST /users/me/change-password` — changes the password while logged in
   (requires the current password).

**Ownership rule:** every protected route derives the acting user from the verified
JWT (`current_user.user_id`) — never from a client-supplied `user_id`. Any category,
transaction, or budget request checks that the resource belongs to the authenticated
user before returning or modifying it; mismatches return `404`, not `403`, so a caller
can't distinguish "not yours" from "doesn't exist."

## API Overview

| Area | Endpoints |
|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/forgot-password`, `/auth/reset-password` |
| Users | `/users/me`, `/users/me/preferences`, `/users/me/change-password` |
| Categories | `/categories/` (GET, POST), `/categories/{id}` (GET, PUT, DELETE) |
| Transactions | `/transactions/` (GET, POST), `/transactions/{id}` (GET, PUT, DELETE) |
| Budgets | `/budgets/` (GET, POST), `/budgets/{id}` (GET, PUT, DELETE) |
| Dashboard | `/dashboard/`, `/dashboard/category-summary`, `/dashboard/monthly-spending`, `/dashboard/budget-vs-spending`, `/dashboard/top-expenses`, `/dashboard/recent-transactions`, `/dashboard/highest-spending-month`, `/dashboard/prediction`, `/dashboard/alerts` |

Full interactive documentation (with request/response schemas) is available at
`/docs` (Swagger UI) or `/redoc` while the server is running.

## Health Check

GET /health

Returns `{"status": "healthy"}` — useful for uptime monitoring or deployment checks.

## Known Limitations / Next Steps

- No automated test suite yet — consider adding `pytest` + `httpx` for endpoint tests.
- No refresh-token rotation/blacklist — refresh tokens are valid until they expire.
- Email sending falls back to printing the OTP/reset token to the console if the
  configured email service fails, for local development convenience. Confirm real
  email delivery is working before relying on this in any shared or deployed environment.
- Rate limiting is not implemented on auth endpoints (login, OTP, password reset) —
  worth adding before any public deployment.

## License

Personal project — add a license here if you intend to open-source it.