from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date
import calendar

from app.models.transactions import Transaction, TransactionType
from app.models.categories import Category
from app.models.budget import Budget
from app.models.users import User


class DashboardService:

    @staticmethod
    def get_summary(db: Session, current_user: User):
        user_id = current_user.user_id

        income = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.income
        ).scalar()

        expense = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.expense
        ).scalar()

        transaction_count = db.query(func.count(Transaction.transaction_id)).filter(
            Transaction.user_id == user_id
        ).scalar()

        highest = db.query(
            Category.category_name,
            func.sum(Transaction.amount).label("total")
        ).join(Transaction, Transaction.category_id == Category.category_id).filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.expense
        ).group_by(Category.category_name).order_by(func.sum(Transaction.amount).desc()).first()

        return {
            "total_income": float(income),
            "total_expenses": float(expense),
            "remaining_balance": float(income - expense),
            "number_of_transactions": transaction_count,
            "highest_expense_category": highest[0] if highest else None
        }

    @staticmethod
    def get_category_summary(db: Session, current_user: User):
        rows = db.query(
            Category.category_name,
            func.sum(Transaction.amount).label("amount")
        ).join(Transaction, Transaction.category_id == Category.category_id).filter(
            Transaction.user_id == current_user.user_id,
            Transaction.type == TransactionType.expense
        ).group_by(Category.category_name).order_by(func.sum(Transaction.amount).desc()).all()

        return {
            "category_summary": [
                {"category": row[0], "amount": float(row[1])} for row in rows
            ]
        }

    @staticmethod
    def get_monthly_spending(db: Session, current_user: User):
        rows = db.query(
            func.to_char(Transaction.date, "YYYY-MM").label("month"),
            func.sum(Transaction.amount).label("amount")
        ).filter(
            Transaction.user_id == current_user.user_id,
            Transaction.type == TransactionType.expense
        ).group_by("month").order_by("month").all()

        return {
            "monthly_spending": [
                {"month": row[0], "amount": float(row[1])} for row in rows
            ]
        }

    @staticmethod
    def get_budget_vs_spending(db: Session, current_user: User):
        budgets = db.query(Budget).filter(Budget.user_id == current_user.user_id).all()

        result = []
        for budget in budgets:
            spent = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
                Transaction.user_id == current_user.user_id,
                Transaction.category_id == budget.category_id,
                Transaction.type == TransactionType.expense,
                extract("month", Transaction.date) == budget.month,
                extract("year", Transaction.date) == budget.year
            ).scalar()

            category = db.query(Category).filter(Category.category_id == budget.category_id).first()

            result.append({
                "category": category.category_name if category else "Unknown",
                "budget": float(budget.amount),
                "spent": float(spent),
                "difference": float(budget.amount - spent)
            })

        return {"budget_vs_actual": result}

    @staticmethod
    def get_alerts(db: Session, current_user: User):
        budgets = db.query(Budget).filter(Budget.user_id == current_user.user_id).all()

        alerts = []
        for budget in budgets:
            spent = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
                Transaction.user_id == current_user.user_id,
                Transaction.category_id == budget.category_id,
                Transaction.type == TransactionType.expense,
                extract("month", Transaction.date) == budget.month,
                extract("year", Transaction.date) == budget.year
            ).scalar()

            category = db.query(Category).filter(Category.category_id == budget.category_id).first()
            over_by = float(spent - budget.amount)

            alerts.append({
                "category": category.category_name if category else "Unknown",
                "budget": float(budget.amount),
                "spent": float(spent),
                "status": "OVERSPENT" if spent > budget.amount else "OK",
                "over_by": over_by if over_by > 0 else 0
            })

        return {"alerts": alerts}

    @staticmethod
    def get_prediction(db: Session, current_user: User):
        today = date.today()
        year = today.year
        month = today.month
        day_of_month = today.day
        days_in_month = calendar.monthrange(year, month)[1]

        spent_so_far = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == current_user.user_id,
            Transaction.type == TransactionType.expense,
            extract("year", Transaction.date) == year,
            extract("month", Transaction.date) == month
        ).scalar()

        prediction = 0 if day_of_month == 0 else (float(spent_so_far) / day_of_month) * days_in_month

        return {
            "spent_so_far": float(spent_so_far),
            "predicted_month_end_spending": round(prediction, 2)
        }