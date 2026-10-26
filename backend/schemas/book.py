from pydantic import BaseModel


class BookResponse(BaseModel):
    id: int
    book_id: str
    author_id: str
    title: str
    isbn: str
    genre: str
    publication_date: str | None = None
    status: str
    mrp: float | None = None
    author_royalty_per_copy: float | None = None
    total_copies_sold: int = 0
    total_royalty_earned: float = 0.0
    royalty_paid: float = 0.0
    royalty_pending: float = 0.0
    last_royalty_payout_date: str | None = None
    print_partner: str | None = None
    available_on: list[str] = []

    class Config:
        from_attributes = True
