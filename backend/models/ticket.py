from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base
from models.internal_note import InternalNote
from models.ticket_message import TicketMessage
from models.user import User


def utc_now() -> datetime:
    return datetime.now(UTC)


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticket_number: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False
    )
    author_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.author_id"), nullable=False, index=True
    )
    book_id: Mapped[str | None] = mapped_column(String, nullable=True)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    category: Mapped[str] = mapped_column(String, nullable=False)
    ai_category: Mapped[str | None] = mapped_column(String, nullable=True)
    priority: Mapped[str] = mapped_column(String, nullable=False, default="Medium")
    ai_priority: Mapped[str | None] = mapped_column(String, nullable=True)
    ai_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(String, nullable=False, default="Open")
    assigned_to: Mapped[str | None] = mapped_column(String, nullable=True)
    attachment_name: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now
    )

    author: Mapped[User] = relationship(back_populates="tickets")
    messages: Mapped[list[TicketMessage]] = relationship(
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="TicketMessage.created_at",
    )
    internal_notes: Mapped[list[InternalNote]] = relationship(
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="InternalNote.created_at",
    )
