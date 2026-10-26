from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.auth import get_current_user, require_admin
from core.db import get_db
from models.user import User
from schemas.ticket import (
    CreateMessageRequest,
    CreateNoteRequest,
    CreateTicketRequest,
    TicketDetailResponse,
    TicketListResponse,
    UpdateTicketRequest,
)
from services import ticket_service

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("", response_model=list[TicketListResponse])
def get_tickets(
    status_filter: str | None = Query(None, alias="status"),
    category: str | None = None,
    priority: str | None = None,
    date_filter: str | None = None,
    search: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ticket_service.list_tickets(
        db=db,
        current_user=current_user,
        status_filter=status_filter,
        category=category,
        priority=priority,
        date_filter=date_filter,
        search=search,
    )


@router.post("", response_model=TicketDetailResponse)
async def create_ticket(
    body: CreateTicketRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await ticket_service.create_ticket(
        db=db, current_user=current_user, body=body
    )


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ticket_service.get_ticket_detail(
        db=db, ticket_id=ticket_id, current_user=current_user
    )


@router.patch("/{ticket_id}", response_model=TicketDetailResponse)
def update_ticket(
    ticket_id: int,
    body: UpdateTicketRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return ticket_service.update_ticket(
        db=db, current_user=current_user, ticket_id=ticket_id, body=body
    )


@router.post("/{ticket_id}/messages", response_model=TicketDetailResponse)
def add_message(
    ticket_id: int,
    body: CreateMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ticket_service.add_message(
        db=db, current_user=current_user, ticket_id=ticket_id, body=body
    )


@router.post("/{ticket_id}/notes", response_model=TicketDetailResponse)
def add_internal_note(
    ticket_id: int,
    body: CreateNoteRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return ticket_service.add_internal_note(
        db=db, current_user=current_user, ticket_id=ticket_id, body=body
    )


@router.post("/{ticket_id}/ai-draft")
async def generate_draft(
    ticket_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    draft = await ticket_service.generate_ticket_draft(
        db=db, current_user=current_user, ticket_id=ticket_id
    )
    return {"draft": draft}
