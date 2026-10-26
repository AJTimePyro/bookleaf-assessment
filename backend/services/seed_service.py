import json
import logging
from pathlib import Path

from sqlalchemy.orm import Session

from core.auth import hash_password
from core.config import settings
from models import Book, InternalNote, Ticket, TicketMessage, User

logger = logging.getLogger(__name__)


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    json_path = Path(settings.SAMPLE_DATA_PATH)
    if not json_path.exists():
        logger.error(f"Sample data file not found at {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    admin = User(
        email="admin@bookleaf.com",
        name="BookLeaf Operations Team",
        role="admin",
        hashed_password=hash_password("admin123"),
        phone="+91-11-4000-0000",
        city="Delhi",
        joined_date="2022-01-01",
    )
    db.add(admin)

    default_password_hash = hash_password("password123")
    for author_dict in data.get("authors", []):
        author = User(
            author_id=author_dict.get("author_id"),
            email=author_dict.get("email"),
            name=author_dict.get("name"),
            role="author",
            hashed_password=default_password_hash,
            phone=author_dict.get("phone"),
            city=author_dict.get("city"),
            joined_date=author_dict.get("joined_date"),
        )
        db.add(author)

        for b in author_dict.get("books", []):
            book = Book(
                book_id=b.get("book_id"),
                author_id=author_dict.get("author_id"),
                title=b.get("title"),
                isbn=b.get("isbn"),
                genre=b.get("genre"),
                publication_date=b.get("publication_date"),
                status=b.get("status"),
                mrp=b.get("mrp"),
                author_royalty_per_copy=b.get("author_royalty_per_copy"),
                total_copies_sold=b.get("total_copies_sold", 0),
                total_royalty_earned=b.get("total_royalty_earned", 0.0),
                royalty_paid=b.get("royalty_paid", 0.0),
                royalty_pending=b.get("royalty_pending", 0.0),
                last_royalty_payout_date=b.get("last_royalty_payout_date"),
                print_partner=b.get("print_partner"),
            )
            book.available_on = b.get("available_on", [])
            db.add(book)

    db.commit()

    demo_tickets = [
        {
            "ticket_number": "TICK-1001",
            "author_id": "AUTH001",
            "book_id": "BK001",
            "subject": "Urgent: ISBN discrepancy on Amazon India",
            "description": "My book Whispers of the Ganges is displaying a different ISBN on Amazon India than what is printed on the physical copy (978-93-5XXXX-01-1). Readers are getting confused and leaving reviews about this.",
            "category": "ISBN & Metadata Issues",
            "ai_category": "ISBN & Metadata Issues",
            "priority": "Critical",
            "ai_priority": "Critical",
            "ai_reason": "High-urgency metadata defect impacting platform listing integrity and author reputation.",
            "status": "In Progress",
            "assigned_to": "admin@bookleaf.com",
            "messages": [
                {
                    "sender_id": "AUTH001",
                    "sender_name": "Priya Sharma",
                    "sender_role": "author",
                    "content": "My book Whispers of the Ganges is displaying a different ISBN on Amazon India than what is printed on the physical copy (978-93-5XXXX-01-1). Readers are getting confused and leaving reviews about this.",
                },
                {
                    "sender_id": "admin@bookleaf.com",
                    "sender_name": "BookLeaf Operations Team",
                    "sender_role": "admin",
                    "content": "Dear Priya,\n\nThank you for alerting us immediately. We treat ISBN discrepancies as critical priority. I have escalated this directly to our senior production and catalog team. We are submitting a direct corrections request to Amazon India Catalog Services. We will follow up with confirmation within 48 hours.\n\nWarm regards,\nBookLeaf Author Support Team",
                },
            ],
            "notes": [
                {
                    "admin_id": "admin@bookleaf.com",
                    "admin_name": "BookLeaf Operations Team",
                    "content": "Internal Escalation: Ticket logged with Amazon Vendor Central under Case ID #IN-88921. Expedited resolution requested.",
                }
            ],
        },
        {
            "ticket_number": "TICK-1002",
            "author_id": "AUTH002",
            "book_id": "BK003",
            "subject": "Print defect in latest author shipment copies",
            "description": "I received my batch of 20 author copies for Code & Karma yesterday. In at least 8 copies, the binding is loose and the interior diagrams are blurry and unreadable.",
            "category": "Printing & Quality",
            "ai_category": "Printing & Quality",
            "priority": "High",
            "ai_priority": "High",
            "ai_reason": "Author reported defective physical copies requiring photo verification and reprint workflow.",
            "status": "Open",
            "assigned_to": None,
            "messages": [
                {
                    "sender_id": "AUTH002",
                    "sender_name": "Rohit Kapoor",
                    "sender_role": "author",
                    "content": "I received my batch of 20 author copies for Code & Karma yesterday. In at least 8 copies, the binding is loose and the interior diagrams are blurry and unreadable.",
                }
            ],
            "notes": [],
        },
        {
            "ticket_number": "TICK-1003",
            "author_id": "AUTH003",
            "book_id": "BK005",
            "subject": "Book showing Currently Unavailable on Amazon India",
            "description": "Readers contacted me today saying The Hyderabad Chronicle is showing as 'Currently Unavailable' on Amazon India even though it was live last week. Could you please check this?",
            "category": "Distribution & Availability",
            "ai_category": "Distribution & Availability",
            "priority": "High",
            "ai_priority": "High",
            "ai_reason": "Stock synchronization delay affecting active sales channels.",
            "status": "In Progress",
            "assigned_to": "admin@bookleaf.com",
            "messages": [
                {
                    "sender_id": "AUTH003",
                    "sender_name": "Ananya Reddy",
                    "sender_role": "author",
                    "content": "Readers contacted me today saying The Hyderabad Chronicle is showing as 'Currently Unavailable' on Amazon India even though it was live last week. Could you please check this?",
                }
            ],
            "notes": [
                {
                    "admin_id": "admin@bookleaf.com",
                    "admin_name": "BookLeaf Operations Team",
                    "content": "Inventory API push initiated to Repro India / Amazon feed at 10:30 AM. Waiting for platform re-indexing.",
                }
            ],
        },
        {
            "ticket_number": "TICK-1004",
            "author_id": "AUTH010",
            "book_id": "BK016",
            "subject": "Royalty payout inquiry for The Canvas of Calcutta",
            "description": "Hello, I noticed I have ₹850 in pending royalties for The Canvas of Calcutta, but I haven't received a bank transfer for this quarter. Can you explain when I will receive it?",
            "category": "Royalty & Payments",
            "ai_category": "Royalty & Payments",
            "priority": "Medium",
            "ai_priority": "Medium",
            "ai_reason": "Inquiry regarding pending payout below the ₹1,000 threshold.",
            "status": "Open",
            "assigned_to": None,
            "messages": [
                {
                    "sender_id": "AUTH010",
                    "sender_name": "Diya Chatterjee",
                    "sender_role": "author",
                    "content": "Hello, I noticed I have ₹850 in pending royalties for The Canvas of Calcutta, but I haven't received a bank transfer for this quarter. Can you explain when I will receive it?",
                }
            ],
            "notes": [],
        },
    ]

    for t_data in demo_tickets:
        ticket = Ticket(
            ticket_number=t_data["ticket_number"],
            author_id=t_data["author_id"],
            book_id=t_data["book_id"],
            subject=t_data["subject"],
            description=t_data["description"],
            category=t_data["category"],
            ai_category=t_data["ai_category"],
            priority=t_data["priority"],
            ai_priority=t_data["ai_priority"],
            ai_reason=t_data["ai_reason"],
            status=t_data["status"],
            assigned_to=t_data["assigned_to"],
        )
        db.add(ticket)
        db.flush()

        for m_data in t_data["messages"]:
            msg = TicketMessage(
                ticket_id=ticket.id,
                sender_id=m_data["sender_id"],
                sender_name=m_data["sender_name"],
                sender_role=m_data["sender_role"],
                content=m_data["content"],
            )
            db.add(msg)

        for n_data in t_data["notes"]:
            note = InternalNote(
                ticket_id=ticket.id,
                admin_id=n_data["admin_id"],
                admin_name=n_data["admin_name"],
                content=n_data["content"],
            )
            db.add(note)

    db.commit()
