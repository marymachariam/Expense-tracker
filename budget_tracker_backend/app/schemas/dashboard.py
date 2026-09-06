from pydantic import BaseModel
from typing import List, Optional


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    remaining_balance: float
    number_of_transactions: int
    highest_expense_category: Optional[str]


class CategorySummaryItem(BaseModel):
    category: str
    amount: float


class MonthlySpendingItem(BaseModel):
    month: str
    amount: float


class TopExpenseItem(BaseModel):
    description: str
    amount: float
    date: str


class RecentTransactionItem(BaseModel):
    description: str
    amount: float
    type: str
    date: str


class BudgetVsActualItem(BaseModel):
    category: str
    budget: float
    spent: float
    difference: float


class AlertItem(BaseModel):
    category: str
    budget: float
    spent: float
    status: str
    over_by: float


class PredictionResponse(BaseModel):
    spent_so_far: float
    predicted_month_end_spending: float