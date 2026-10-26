import json

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    book_id: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False
    )
    author_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.author_id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    isbn: Mapped[str] = mapped_column(String, nullable=False)
    genre: Mapped[str] = mapped_column(String, nullable=False)
    publication_date: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    mrp: Mapped[float | None] = mapped_column(Float, nullable=True)
    author_royalty_per_copy: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_copies_sold: Mapped[int] = mapped_column(Integer, default=0)
    total_royalty_earned: Mapped[float] = mapped_column(Float, default=0.0)
    royalty_paid: Mapped[float] = mapped_column(Float, default=0.0)
    royalty_pending: Mapped[float] = mapped_column(Float, default=0.0)
    last_royalty_payout_date: Mapped[str | None] = mapped_column(String, nullable=True)
    print_partner: Mapped[str | None] = mapped_column(String, nullable=True)
    available_on_raw: Mapped[str | None] = mapped_column(
        "available_on", Text, nullable=True, default="[]"
    )

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
