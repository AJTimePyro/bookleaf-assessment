from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database.connection import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True, nullable=False)
    author_id = Column(
        String, ForeignKey("users.author_id"), nullable=False, index=True
    )
    book_id = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    category = Column(String, nullable=False)
    ai_category = Column(String, nullable=True)
    priority = Column(String, nullable=False, default="Medium")
    ai_priority = Column(String, nullable=True)
    ai_reason = Column(Text, nullable=True)

    status = Column(String, nullable=False, default="Open")
    assigned_to = Column(String, nullable=True)
    attachment_name = Column(String, nullable=True)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    author = relationship("User", back_populates="tickets")
    messages = relationship(
        "TicketMessage",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="TicketMessage.created_at",
    )
    internal_notes = relationship(
        "InternalNote",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="InternalNote.created_at",
    )
