from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.auth import get_current_user
from core.db import get_db
from models.book import Book
from models.user import User
from schemas.book import BookResponse

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("", response_model=list[BookResponse])
def get_books(
    author_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Book)
    if current_user.role == "author":
        query = query.filter(Book.author_id == current_user.author_id)
    elif author_id:
        query = query.filter(Book.author_id == author_id)

    return query.all()


@router.get("/{book_id}", response_model=BookResponse)
def get_book(
    book_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.book_id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    if current_user.role == "author" and book.author_id != current_user.author_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    return book
