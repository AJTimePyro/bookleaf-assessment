from datetime import datetime
from typing import Any

from pydantic import BaseModel


class CreateTicketRequest(BaseModel):
    book_id: str | None = None
    subject: str
    description: str
    attachment_name: str | None = None


class UpdateTicketRequest(BaseModel):
    category: str | None = None
    priority: str | None = None
    status: str | None = None
    assigned_to: str | None = None


class CreateMessageRequest(BaseModel):
    content: str
    status: str | None = None


class CreateNoteRequest(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class NoteResponse(BaseModel):
    id: int
    admin_id: str
    admin_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    id: int
    ticket_number: str
    author_id: str
    author_name: str | None = None
    book_id: str | None = None
    book_title: str | None = None
    subject: str
    description: str
    category: str
    ai_category: str | None = None
    priority: str
    ai_priority: str | None = None
    ai_reason: str | None = None
    status: str
    assigned_to: str | None = None
    attachment_name: str | None = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class TicketDetailResponse(BaseModel):
    id: int
    ticket_number: str
    author_id: str
    author: dict[str, Any] | None = None
    book_id: str | None = None
    book: dict[str, Any] | None = None
    subject: str
    description: str
    category: str
    ai_category: str | None = None
    priority: str
    ai_priority: str | None = None
    ai_reason: str | None = None
    status: str
    assigned_to: str | None = None
    attachment_name: str | None = None
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse] = []
    internal_notes: list[NoteResponse] = []
