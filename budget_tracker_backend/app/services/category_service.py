from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.models.users import User


class CategoryService:

    @staticmethod
    def create(db: Session, data: CategoryCreate, current_user: User):
        existing = CategoryRepository.get_all_by_user(db, current_user.user_id)
        if any(c.category_name.lower() == data.category_name.lower() for c in existing):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )

        return CategoryRepository.create(db, current_user.user_id, data.category_name)

    @staticmethod
    def get_all(db: Session, current_user: User):
        return CategoryRepository.get_all_by_user(db, current_user.user_id)

    @staticmethod
    def get_by_id(db: Session, category_id: int, current_user: User):
        category = CategoryRepository.get_by_id(db, category_id)
        if not category or category.user_id != current_user.user_id:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    @staticmethod
    def update(db: Session, category_id: int, data: CategoryUpdate, current_user: User):
        category = CategoryService.get_by_id(db, category_id, current_user)
        return CategoryRepository.update(db, category, data.category_name)

    @staticmethod
    def delete(db: Session, category_id: int, current_user: User):
        category = CategoryService.get_by_id(db, category_id, current_user)
        CategoryRepository.delete(db, category)