from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base
from models.ticket import Ticket


def utc_now() -> datetime:
    return datetime.now(UTC)


class InternalNote(Base):
    __tablename__ = "internal_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticket_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tickets.id"), nullable=False, index=True
    )
    admin_id: Mapped[str] = mapped_column(String, nullable=False)
    admin_name: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

    ticket: Mapped[Ticket] = relationship(back_populates="internal_notes")
