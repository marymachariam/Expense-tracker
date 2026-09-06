from pydantic import BaseModel, Field
from typing import Optional


class BudgetCreate(BaseModel):
    category_id: int
    amount: float = Field(..., gt=0)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020)


class BudgetUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = Field(None, gt=0)
    month: Optional[int] = Field(None, ge=1, le=12)
    year: Optional[int] = Field(None, ge=2020)


class BudgetResponse(BaseModel):
    budget_id: int
    user_id: int
    category_id: int
    amount: float
    month: int
    year: int

    class Config:
        from_attributes = True