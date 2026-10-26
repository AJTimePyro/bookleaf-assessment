from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from models import Book, InternalNote, Ticket, TicketMessage, User
from schemas.ticket import (
    CreateMessageRequest,
    CreateNoteRequest,
    CreateTicketRequest,
    MessageResponse,
    NoteResponse,
    TicketDetailResponse,
    TicketListResponse,
    UpdateTicketRequest,
)
from services.ai_service import (
    VALID_CATEGORIES,
    VALID_PRIORITIES,
    draft_ticket_response,
    triage_ticket,
)

PRIORITY_WEIGHT = {
    "Critical": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1,
}


def get_ticket_detail(
    db: Session, ticket_id: int, current_user: User
) -> TicketDetailResponse:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if current_user.role == "author" and ticket.author_id != current_user.author_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    author = db.query(User).filter(User.author_id == ticket.author_id).first()
    author_data = (
        {
            "author_id": author.author_id,
            "name": author.name,
            "email": author.email,
            "phone": author.phone,
            "city": author.city,
            "joined_date": author.joined_date,
        }
        if author
        else None
    )

    book = None
    if ticket.book_id:
        b = db.query(Book).filter(Book.book_id == ticket.book_id).first()
        if b:
            book = {
                "book_id": b.book_id,
                "title": b.title,
                "isbn": b.isbn,
                "genre": b.genre,
                "status": b.status,
                "mrp": b.mrp,
                "author_royalty_per_copy": b.author_royalty_per_copy,
                "total_copies_sold": b.total_copies_sold,
                "total_royalty_earned": b.total_royalty_earned,
                "royalty_paid": b.royalty_paid,
                "royalty_pending": b.royalty_pending,
                "last_royalty_payout_date": b.last_royalty_payout_date,
                "print_partner": b.print_partner,
                "available_on": b.available_on,
            }

    internal_notes = []
    if current_user.role == "admin":
        internal_notes = [NoteResponse.model_validate(n) for n in ticket.internal_notes]

    return TicketDetailResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        author_id=ticket.author_id,
        author=author_data,
        book_id=ticket.book_id,
        book=book,
        subject=ticket.subject,
        description=ticket.description,
        category=ticket.category,
        ai_category=ticket.ai_category,
        priority=ticket.priority,
        ai_priority=ticket.ai_priority,
        ai_reason=ticket.ai_reason,
        status=ticket.status,
        assigned_to=ticket.assigned_to,
        attachment_name=ticket.attachment_name,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=[MessageResponse.model_validate(m) for m in ticket.messages],
        internal_notes=internal_notes,
    )


def list_tickets(
    db: Session,
    current_user: User,
    status_filter: str | None = None,
    category: str | None = None,
    priority: str | None = None,
    date_filter: str | None = None,
    search: str | None = None,
) -> list[TicketListResponse]:
    query = db.query(Ticket)

    if current_user.role == "author":
        query = query.filter(Ticket.author_id == current_user.author_id)
    else:
        if status_filter:
            query = query.filter(Ticket.status == status_filter)
        if category:
            query = query.filter(Ticket.category == category)
        if priority:
            query = query.filter(Ticket.priority == priority)
        if date_filter == "today":
            start_date = datetime.now(UTC).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            query = query.filter(Ticket.created_at >= start_date)
        elif date_filter == "7days":
            start_date = datetime.now(UTC) - timedelta(days=7)
            query = query.filter(Ticket.created_at >= start_date)
        elif date_filter == "30days":
            start_date = datetime.now(UTC) - timedelta(days=30)
            query = query.filter(Ticket.created_at >= start_date)
        if search:
            search_pattern = f"%{search}%"
            query = query.join(User, Ticket.author_id == User.author_id).filter(
                or_(
                    Ticket.subject.ilike(search_pattern),
                    Ticket.description.ilike(search_pattern),
                    Ticket.ticket_number.ilike(search_pattern),
                    User.name.ilike(search_pattern),
                )
            )

    tickets = query.all()
    author_map = {u.author_id: u.name for u in db.query(User).all() if u.author_id}
    book_map = {b.book_id: b.title for b in db.query(Book).all()}

    result = []
    for t in tickets:
        result.append(
            TicketListResponse(
                id=t.id,
                ticket_number=t.ticket_number,
                author_id=t.author_id,
                author_name=author_map.get(t.author_id, "Unknown"),
                book_id=t.book_id,
                book_title=book_map.get(t.book_id)
                if t.book_id
                else "General / Account Level",
                subject=t.subject,
                description=t.description,
                category=t.category,
                ai_category=t.ai_category,
                priority=t.priority,
                ai_priority=t.ai_priority,
                ai_reason=t.ai_reason,
                status=t.status,
                assigned_to=t.assigned_to,
                attachment_name=t.attachment_name,
                created_at=t.created_at,
                updated_at=t.updated_at,
                message_count=len(t.messages),
            )
        )

    if current_user.role == "admin":
        result.sort(
            key=lambda x: (
                1 if x.status in ["Resolved", "Closed"] else 0,
                -PRIORITY_WEIGHT.get(x.priority, 1),
                x.created_at,
            )
        )
    else:
        result.sort(key=lambda x: x.created_at, reverse=True)

    return result


async def create_ticket(
    db: Session, current_user: User, body: CreateTicketRequest
) -> TicketDetailResponse:
    if current_user.role != "author":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only authors can raise support tickets",
        )

    book_info = None
    if body.book_id:
        book = (
            db.query(Book)
            .filter(
                Book.book_id == body.book_id, Book.author_id == current_user.author_id
            )
            .first()
        )
        if book:
            book_info = {
                "title": book.title,
                "status": book.status,
                "isbn": book.isbn,
                "mrp": book.mrp,
                "royalty_pending": book.royalty_pending,
            }

    triage_result = await triage_ticket(body.subject, body.description, book_info)
    last_id = db.query(func.max(Ticket.id)).scalar() or 0
    ticket_number = f"TICK-{1000 + last_id + 1}"

    ticket = Ticket(
        ticket_number=ticket_number,
        author_id=current_user.author_id,
        book_id=body.book_id,
        subject=body.subject,
        description=body.description,
        category=triage_result["category"],
        ai_category=triage_result["category"],
        priority=triage_result["priority"],
        ai_priority=triage_result["priority"],
        ai_reason=triage_result.get("reason"),
        status="Open",
        attachment_name=body.attachment_name,
    )
    db.add(ticket)
    db.flush()

    initial_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.author_id,
        sender_name=current_user.name,
        sender_role="author",
        content=body.description,
    )
    db.add(initial_msg)
    db.commit()
    db.refresh(ticket)

    return get_ticket_detail(db, ticket.id, current_user)


def update_ticket(
    db: Session, current_user: User, ticket_id: int, body: UpdateTicketRequest
) -> TicketDetailResponse:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if body.category is not None:
        if body.category not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category. Must be one of {VALID_CATEGORIES}",
            )
        ticket.category = body.category

    if body.priority is not None:
        if body.priority not in VALID_PRIORITIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid priority. Must be one of {VALID_PRIORITIES}",
            )
        ticket.priority = body.priority

    if body.status is not None:
        if body.status not in ["Open", "In Progress", "Resolved", "Closed"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        ticket.status = body.status

    if body.assigned_to is not None:
        ticket.assigned_to = body.assigned_to

    ticket.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(ticket)
    return get_ticket_detail(db, ticket.id, current_user)


def add_message(
    db: Session, current_user: User, ticket_id: int, body: CreateMessageRequest
) -> TicketDetailResponse:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if current_user.role == "author" and ticket.author_id != current_user.author_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    sender_id = (
        current_user.author_id if current_user.role == "author" else current_user.email
    )
    msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=sender_id,
        sender_name=current_user.name,
        sender_role=current_user.role,
        content=body.content,
    )
    db.add(msg)

    if current_user.role == "admin":
        if body.status:
            ticket.status = body.status
        elif ticket.status == "Open":
            ticket.status = "In Progress"

    ticket.updated_at = datetime.now(UTC)
    db.commit()
    return get_ticket_detail(db, ticket.id, current_user)


def add_internal_note(
    db: Session, current_user: User, ticket_id: int, body: CreateNoteRequest
) -> TicketDetailResponse:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    note = InternalNote(
        ticket_id=ticket.id,
        admin_id=current_user.email,
        admin_name=current_user.name,
        content=body.content,
    )
    db.add(note)
    ticket.updated_at = datetime.now(UTC)
    db.commit()
    return get_ticket_detail(db, ticket.id, current_user)


async def generate_ticket_draft(db: Session, current_user: User, ticket_id: int) -> str:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    author = db.query(User).filter(User.author_id == ticket.author_id).first()
    author_data = {
        "name": author.name if author else "Author",
        "email": author.email if author else "",
        "phone": author.phone if author else "",
        "city": author.city if author else "",
        "joined_date": author.joined_date if author else "",
    }

    book_data = None
    if ticket.book_id:
        b = db.query(Book).filter(Book.book_id == ticket.book_id).first()
        if b:
            book_data = {
                "title": b.title,
                "isbn": b.isbn,
                "status": b.status,
                "mrp": b.mrp,
                "author_royalty_per_copy": b.author_royalty_per_copy,
                "total_copies_sold": b.total_copies_sold,
                "total_royalty_earned": b.total_royalty_earned,
                "royalty_paid": b.royalty_paid,
                "royalty_pending": b.royalty_pending,
                "print_partner": b.print_partner,
                "available_on": b.available_on,
            }

    ticket_data = {
        "subject": ticket.subject,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority,
    }

    messages = [
        {"sender_role": m.sender_role, "content": m.content} for m in ticket.messages
    ]

    return await draft_ticket_response(ticket_data, author_data, book_data, messages)
