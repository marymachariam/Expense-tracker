from fastapi import FastAPI
from pydantic import BaseModel
from database import connect, get_cursor
import datetime
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from datetime import datetime as dt, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your-secret-key-keep-it-safe"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = dt.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

@app.get('/')
def home():
    return {'Message': 'Welcome to Macharias Smart Budget Tracker API!'}

# ─── AUTH ────────────────────────────────────────────────────────────────────

class RegisterUser(BaseModel):
    username: str
    email: str
    password: str

@app.post("/register")
def register(user: RegisterUser):
    cursor = get_cursor()
    cursor.execute(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        (user.username, user.email, user.password)
    )
    connect.commit()
    return {"message": "User created successfully!"}

class LoginUser(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(user: LoginUser):
    cursor = get_cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()

    if not db_user:
        return {"error": "Invalid email or password"}

    if user.password != db_user[3]:
        return {"error": "Invalid email or password"}

    token = create_access_token(data={
        "user_id": db_user[0],
        "username": db_user[1]
    })

    return {
        "message": "Login successful",
        "token": token,
        "user_id": db_user[0],
        "username": db_user[1]
    }

# ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

class Transaction(BaseModel):
    user_id: int
    amount: float
    category_id: int
    type: str
    description: str
    date: str

@app.post("/transactions")
def create_transaction(transaction: Transaction):
    cursor = get_cursor()
    cursor.execute(
        "INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)",
        (transaction.user_id, transaction.category_id, transaction.amount, transaction.type, transaction.description, transaction.date)
    )
    connect.commit()
    return {"message": "Transaction added successfully"}

@app.get("/transactions")
def get_transactions(user_id: int):
    cursor = get_cursor()
    cursor.execute("SELECT * FROM transactions WHERE user_id = ?", (user_id,))
    return {"transactions": cursor.fetchall()}

@app.get("/transactions/{transaction_id}")
def get_transaction(transaction_id: int):
    cursor = get_cursor()
    cursor.execute("SELECT * FROM transactions WHERE transaction_id = ?", (transaction_id,))
    transaction = cursor.fetchone()
    if transaction is None:
        return {"message": "Transaction not found"}
    return {"transaction": transaction}

@app.put("/transactions/{transaction_id}")
def update_transaction(transaction_id: int, transaction: Transaction):
    cursor = get_cursor()
    cursor.execute(
        "UPDATE transactions SET user_id=?, category_id=?, amount=?, type=?, description=?, date=? WHERE transaction_id=?",
        (transaction.user_id, transaction.category_id, transaction.amount, transaction.type, transaction.description, transaction.date, transaction_id)
    )
    if cursor.rowcount == 0:
        return {"message": "Transaction not found"}
    connect.commit()
    return {"message": "Transaction updated successfully"}

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int):
    cursor = get_cursor()
    cursor.execute("DELETE FROM transactions WHERE transaction_id = ?", (transaction_id,))
    if cursor.rowcount == 0:
        return {"message": "Transaction not found"}
    connect.commit()
    return {"message": "Transaction deleted successfully"}

# ─── CATEGORIES ───────────────────────────────────────────────────────────────

class Category(BaseModel):
    user_id: int
    category_name: str

@app.post("/categories")
def create_category(category: Category):
    cursor = get_cursor()
    cursor.execute(
        "INSERT INTO categories (user_id, category_name) VALUES (?, ?)",
        (category.user_id, category.category_name)
    )
    connect.commit()
    return {"message": "Category created successfully"}

@app.get("/categories")
def get_categories(user_id: int):
    cursor = get_cursor()
    cursor.execute("SELECT * FROM categories WHERE user_id = ?", (user_id,))
    return {"categories": cursor.fetchall()}

@app.get("/categories/{category_id}")
def get_category(category_id: int):
    cursor = get_cursor()
    cursor.execute("SELECT * FROM categories WHERE category_id = ?", (category_id,))
    category = cursor.fetchone()
    if category is None:
        return {"message": "Category not found"}
    return {"category": category}

@app.put("/categories/{category_id}")
def update_category(category_id: int, category: Category):
    cursor = get_cursor()
    cursor.execute(
        "UPDATE categories SET user_id=?, category_name=? WHERE category_id=?",
        (category.user_id, category.category_name, category_id)
    )
    connect.commit()
    return {"message": "Category updated successfully"}

@app.delete("/categories/{category_id}")
def delete_category(category_id: int):
    cursor = get_cursor()
    cursor.execute("DELETE FROM categories WHERE category_id = ?", (category_id,))
    connect.commit()
    return {"message": "Category deleted successfully"}

# ─── BUDGETS ──────────────────────────────────────────────────────────────────

class Budget(BaseModel):
    user_id: int
    category_id: int
    amount: float
    month: int
    year: int

@app.post("/budgets")
def create_budget(budget: Budget):
    cursor = get_cursor()
    cursor.execute(
        "INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES (?, ?, ?, ?, ?)",
        (budget.user_id, budget.category_id, budget.amount, budget.month, budget.year)
    )
    connect.commit()
    return {"message": "Budget created successfully"}

@app.get("/budgets")
def get_budgets(user_id: int):
    cursor = get_cursor()
    cursor.execute("SELECT * FROM budgets WHERE user_id = ?", (user_id,))
    return {"budgets": cursor.fetchall()}

@app.get("/budgets/{budget_id}")
def get_budget(budget_id: int):
    cursor = get_cursor()
    cursor.execute("SELECT * FROM budgets WHERE budget_id = ?", (budget_id,))
    budget = cursor.fetchone()
    if budget is None:
        return {"message": "Budget not found"}
    return {"budget": budget}

@app.put("/budgets/{budget_id}")
def update_budget(budget_id: int, budget: Budget):
    cursor = get_cursor()
    cursor.execute(
        "UPDATE budgets SET user_id=?, category_id=?, amount=?, month=?, year=? WHERE budget_id=?",
        (budget.user_id, budget.category_id, budget.amount, budget.month, budget.year, budget_id)
    )
    if cursor.rowcount == 0:
        return {"message": "Budget not found"}
    connect.commit()
    return {"message": "Budget updated successfully"}

@app.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int):
    cursor = get_cursor()
    cursor.execute("DELETE FROM budgets WHERE budget_id = ?", (budget_id,))
    if cursor.rowcount == 0:
        return {"message": "Budget not found"}
    connect.commit()
    return {"message": "Budget deleted successfully"}

# ─── DASHBOARD ────────────────────────────────────────────────────────────────

@app.get("/dashboard")
def dashboard(user_id: int):
    cursor = get_cursor()

    cursor.execute("SELECT SUM(amount) FROM transactions WHERE type='income' AND user_id=?", (user_id,))
    income = cursor.fetchone()[0] or 0

    cursor.execute("SELECT SUM(amount) FROM transactions WHERE type='expense' AND user_id=?", (user_id,))
    expense = cursor.fetchone()[0] or 0

    balance = income - expense

    cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id=?", (user_id,))
    transaction_count = cursor.fetchone()[0]

    cursor.execute("""
        SELECT c.category_name, SUM(t.amount) AS total_spent
        FROM transactions t
        JOIN categories c ON t.category_id = c.category_id
        WHERE t.type = 'expense' AND t.user_id = ?
        GROUP BY c.category_name
        ORDER BY total_spent DESC
        LIMIT 1
    """, (user_id,))
    highest = cursor.fetchone()
    highest_category = highest[0] if highest else "None"

    return {
        "total_income": income,
        "total_expenses": expense,
        "remaining_balance": balance,
        "number_of_transactions": transaction_count,
        "highest_expense_category": highest_category
    }

@app.get("/dashboard/category-summary")
def category_summary(user_id: int):
    cursor = get_cursor()
    cursor.execute("""
        SELECT c.category_name, SUM(t.amount) AS total_spent
        FROM transactions t
        JOIN categories c ON t.category_id = c.category_id
        WHERE t.type = 'expense' AND t.user_id = ?
        GROUP BY c.category_name
        ORDER BY total_spent DESC
    """, (user_id,))
    rows = cursor.fetchall()
    return {"category_summary": [{"category": r[0], "amount": r[1]} for r in rows]}

@app.get("/dashboard/monthly-spending")
def monthly_spending(user_id: int):
    cursor = get_cursor()
    cursor.execute("""
        SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total_spent
        FROM transactions
        WHERE type = 'expense' AND user_id = ?
        GROUP BY month
        ORDER BY month
    """, (user_id,))
    rows = cursor.fetchall()
    return {"monthly_spending": [{"month": r[0], "amount": r[1]} for r in rows]}

@app.get("/dashboard/top-expenses")
def top_expenses(user_id: int):
    cursor = get_cursor()
    cursor.execute("""
        SELECT description, amount, date
        FROM transactions
        WHERE type = 'expense' AND user_id = ?
        ORDER BY amount DESC
        LIMIT 5
    """, (user_id,))
    rows = cursor.fetchall()
    return {"top_expenses": [{"description": r[0], "amount": r[1], "date": r[2]} for r in rows]}

@app.get("/dashboard/recent-transactions")
def recent_transactions(user_id: int):
    cursor = get_cursor()
    cursor.execute("""
        SELECT description, amount, type, date
        FROM transactions
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT 5
    """, (user_id,))
    rows = cursor.fetchall()
    return {"recent_transactions": [{"description": r[0], "amount": r[1], "type": r[2], "date": r[3]} for r in rows]}

@app.get("/dashboard/budget-vs-spending")
def budget_vs_spending(user_id: int):
    cursor = get_cursor()
    cursor.execute("""
        SELECT c.category_name, b.amount AS budget,
               COALESCE(SUM(t.amount), 0) AS spent
        FROM budgets b
        JOIN categories c ON b.category_id = c.category_id
        LEFT JOIN transactions t
            ON t.category_id = b.category_id
            AND t.type = 'expense'
            AND t.user_id = ?
        WHERE b.user_id = ?
        GROUP BY b.category_id
    """, (user_id, user_id))
    rows = cursor.fetchall()
    return {"budget_vs_actual": [{"category": r[0], "budget": r[1], "spent": r[2], "difference": r[1] - r[2]} for r in rows]}

@app.get("/dashboard/highest-spending-month")
def highest_spending_month(user_id: int):
    cursor = get_cursor()
    cursor.execute("""
        SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total_spent
        FROM transactions
        WHERE type = 'expense' AND user_id = ?
        GROUP BY month
        ORDER BY total_spent DESC
        LIMIT 1
    """, (user_id,))
    row = cursor.fetchone()
    if not row:
        return {"highest_spending_month": None}
    return {"highest_spending_month": {"month": row[0], "amount": row[1]}}

@app.get("/dashboard/prediction")
def end_of_month_prediction(user_id: int):
    cursor = get_cursor()
    cursor.execute("""
        SELECT SUM(amount) FROM transactions
        WHERE type = 'expense' AND user_id = ?
        AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    """, (user_id,))
    spent_so_far = cursor.fetchone()[0] or 0

    today = datetime.date.today()
    day_of_month = today.day
    next_month = today.replace(day=28) + datetime.timedelta(days=4)
    days_in_month = (next_month - datetime.timedelta(days=next_month.day)).day

    prediction = 0 if day_of_month == 0 else (spent_so_far / day_of_month) * days_in_month

    return {
        "spent_so_far": spent_so_far,
        "predicted_month_end_spending": round(prediction, 2)
    }

@app.get("/dashboard/alerts")
def spending_alerts(user_id: int):
    cursor = get_cursor()
    cursor.execute("""
        SELECT c.category_name, b.amount AS budget,
               COALESCE(SUM(t.amount), 0) AS spent
        FROM budgets b
        JOIN categories c ON b.category_id = c.category_id
        LEFT JOIN transactions t
            ON t.category_id = b.category_id
            AND t.type = 'expense'
            AND t.user_id = ?
        WHERE b.user_id = ?
        GROUP BY b.category_id
    """, (user_id, user_id))
    rows = cursor.fetchall()
    alerts = []
    for row in rows:
        spent = row[2]
        budget = row[1]
        alerts.append({
            "category": row[0],
            "budget": budget,
            "spent": spent,
            "status": "OVERSPENT" if spent > budget else "OK",
            "over_by": spent - budget if spent > budget else 0
        })
    return {"alerts": alerts}