from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from database.connection import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="author")
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    joined_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    books = relationship("Book", back_populates="author", cascade="all, delete-orphan")
    tickets = relationship(
        "Ticket", back_populates="author", cascade="all, delete-orphan"
    )
