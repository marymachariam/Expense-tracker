from sqlalchemy.orm import Session
from app.models.categories import Category


class CategoryRepository:

    @staticmethod
    def create(db: Session, user_id: int, category_name: str) -> Category:
        category = Category(user_id=user_id, category_name=category_name)
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def get_all_by_user(db: Session, user_id: int) -> list[Category]:
        return db.query(Category).filter(Category.user_id == user_id).all()

    @staticmethod
    def get_by_id(db: Session, category_id: int) -> Category | None:
        return db.query(Category).filter(Category.category_id == category_id).first()

    @staticmethod
    def update(db: Session, category: Category, category_name: str) -> Category:
        category.category_name = category_name
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete(db: Session, category: Category) -> None:
        db.delete(category)
        db.commit()