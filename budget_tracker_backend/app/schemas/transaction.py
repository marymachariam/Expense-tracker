from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from enum import Enum


class TransactionTypeEnum(str, Enum):
    income = "income"
    expense = "expense"


class TransactionCreate(BaseModel):
    category_id: Optional[int] = None
    amount: float = Field(..., gt=0)
    type: TransactionTypeEnum
    description: str = Field(..., min_length=1, max_length=255)
    date: date


class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[TransactionTypeEnum] = None
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    date: Optional[date] = None


class TransactionResponse(BaseModel):
    transaction_id: int
    user_id: int
    category_id: Optional[int]
    amount: float
    type: str
    description: str
    date: date
    created_at: datetime

    class Config:
        from_attributes = True