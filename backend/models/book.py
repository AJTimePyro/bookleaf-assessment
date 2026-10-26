import json

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database.connection import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(String, unique=True, index=True, nullable=False)
    author_id = Column(
        String, ForeignKey("users.author_id"), nullable=False, index=True
    )
    title = Column(String, nullable=False)
    isbn = Column(String, nullable=False)
    genre = Column(String, nullable=False)
    publication_date = Column(String, nullable=True)
    status = Column(String, nullable=False)
    mrp = Column(Float, nullable=True)
    author_royalty_per_copy = Column(Float, nullable=True)
    total_copies_sold = Column(Integer, default=0)
    total_royalty_earned = Column(Float, default=0.0)
    royalty_paid = Column(Float, default=0.0)
    royalty_pending = Column(Float, default=0.0)
    last_royalty_payout_date = Column(String, nullable=True)
    print_partner = Column(String, nullable=True)
    available_on_raw = Column("available_on", Text, nullable=True, default="[]")

    author = relationship("User", back_populates="books")

    @property
    def available_on(self) -> list[str]:
        if not self.available_on_raw:
            return []
        try:
            return json.loads(self.available_on_raw)
        except Exception:
            return []

    @available_on.setter
    def available_on(self, value: list[str]):
        self.available_on_raw = json.dumps(value or [])
