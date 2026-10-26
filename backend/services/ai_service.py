import json
import logging
from typing import Any

import httpx

from core.config import settings

logger = logging.getLogger(__name__)

BOOKLEAF_KNOWLEDGE_BASE = """
You are an expert, empathetic, and professional AI support assistant for BookLeaf Publishing.
BookLeaf Publishing operates in India and the US. Authors are our partners, not just tickets to close.

=== OFFICIAL POLICIES & KNOWLEDGE BASE ===
1. ROYALTY POLICY:
- 80/20 split: 80% of net profit per book goes to the author, 20% to BookLeaf.
- Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping charges.
- Royalties are calculated quarterly and paid within 45 days of the quarter ending.
- Minimum payout threshold: ₹1,000. If accumulated royalties are below ₹1,000, they roll over to the next quarter.
- Payouts are made via direct bank transfer to the account linked in the author's dashboard.

2. ISBN & METADATA POLICY:
- Unique ISBN assigned by BookLeaf under BookLeaf's publisher imprint.
- If an author reports an ISBN error (duplicate, wrong book linked, mismatch), treat as HIGH/CRITICAL priority and escalate to the production team immediately with a 48-hour resolution timeline.

3. PRINTING & QUALITY:
- In-house printing in Delhi handles most orders; overflow to partners Repro India or Epitome Books.
- Standard print turnaround: 5–7 business days from order confirmation.
- Quality issues (misprints, binding defects, blurry images): apologize sincerely, request photos of defective copies, and confirm BookLeaf will arrange a 100% free reprint within 5-7 business days once verified.

4. DISTRIBUTION & AVAILABILITY:
- Platforms: Amazon India, Flipkart, Amazon US, Amazon UK, and BookLeaf Store.
- New listings go live within 7–10 business days after publication.
- "Currently Unavailable" status on Amazon/Flipkart is usually a stock sync issue: BookLeaf triggers a re-sync with the platform, resolving within 24–48 hours.

5. PRODUCTION STAGES:
- Stages: Manuscript Received -> Editing (if opted) -> Cover Design -> Typesetting -> Proofreading -> ISBN Assignment -> Printing -> Distribution Setup -> Published & Live.
- Delays typically happen at Cover Design (waiting for author feedback) and Proofreading (revision rounds).
- Always check actual stage and explain reasons transparently and collaboratively without blaming the author.

6. COMMUNICATION GUIDELINES:
- Empathetic & professional partner tone.
- Acknowledge the author's concern before jumping to solutions.
- Be specific: include actual numbers, dates, amounts, and statuses when available.
- If BookLeaf is at fault, own it directly without corporate deflection.
- Give concrete timelines (e.g., "within 24-48 hours", "5-7 business days").
- Always end with a clear next step for both author and BookLeaf team.
"""

VALID_CATEGORIES = [
    "Royalty & Payments",
    "ISBN & Metadata Issues",
    "Printing & Quality",
    "Distribution & Availability",
    "Book Status & Production Updates",
    "General Inquiry",
]

VALID_PRIORITIES = ["Critical", "High", "Medium", "Low"]


async def call_openai_compatible_api(
    messages: list[dict[str, str]], temperature: float = 0.2
) -> str | None:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
    }
    payload = {
        "model": settings.LLM_MODEL,
        "messages": messages,
        "temperature": temperature,
    }

    url = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"
    try:
        async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            logger.warning(
                f"LLM API returned status {response.status_code}: {response.text}"
            )
            return None
    except Exception as e:
        logger.warning(f"Failed to connect to LLM API ({url}): {e}")
        return None


def fallback_triage(subject: str, description: str) -> dict[str, str]:
    text = f"{subject} {description}".lower()

    if any(
        k in text
        for k in [
            "royalty",
            "payment",
            "payout",
            "earning",
            "sold",
            "bank",
            "₹",
            "rs",
            "money",
        ]
    ):
        category = "Royalty & Payments"
    elif any(
        k in text for k in ["isbn", "barcode", "imprint", "metadata", "wrong book"]
    ):
        category = "ISBN & Metadata Issues"
    elif any(
        k in text
        for k in [
            "print",
            "quality",
            "binding",
            "paper",
            "blurry",
            "pages",
            "defect",
            "damaged",
            "copies",
        ]
    ):
        category = "Printing & Quality"
    elif any(
        k in text
        for k in [
            "unavailable",
            "out of stock",
            "amazon",
            "flipkart",
            "listing",
            "store",
            "buy",
        ]
    ):
        category = "Distribution & Availability"
    elif any(
        k in text
        for k in [
            "stage",
            "typesetting",
            "cover",
            "proofreading",
            "status",
            "production",
            "timeline",
            "when will",
        ]
    ):
        category = "Book Status & Production Updates"
    else:
        category = "General Inquiry"

    if any(
        k in text
        for k in [
            "6 months",
            "urgent",
            "emergency",
            "legal",
            "duplicate isbn",
            "wrong isbn",
            "missing payment",
        ]
    ):
        priority = "Critical"
        reason = "Heuristic flag: Query indicates severe delay or critical metadata inconsistency requiring immediate escalation."
    elif any(
        k in text
        for k in [
            "not received",
            "overdue",
            "terrible",
            "misprint",
            "unavailable",
            "defective",
            "waiting",
        ]
    ):
        priority = "High"
        reason = "Heuristic flag: Query highlights active author disruption or defect requiring prompt resolution."
    elif any(
        k in text for k in ["update", "question", "when", "how", "information", "sales"]
    ):
        priority = "Medium"
        reason = "Heuristic flag: Standard operational inquiry."
    else:
        priority = "Low"
        reason = "Heuristic flag: General or account informational inquiry."

    return {
        "category": category,
        "priority": priority,
        "reason": reason,
    }


async def triage_ticket(
    subject: str, description: str, book_info: dict[str, Any] | None = None
) -> dict[str, str]:
    book_context = ""
    if book_info:
        book_context = f"\nLinked Book Context: Title: '{book_info.get('title')}', Status: '{book_info.get('status')}', ISBN: '{book_info.get('isbn')}'"

    system_prompt = """You are an expert support triage classifier for BookLeaf Publishing.
Classify the author's support ticket into exactly one category and one priority level.

Valid Categories:
- Royalty & Payments
- ISBN & Metadata Issues
- Printing & Quality
- Distribution & Availability
- Book Status & Production Updates
- General Inquiry

Valid Priorities:
- Critical
- High
- Medium
- Low

You must return ONLY a valid JSON object:
{
  "category": "<one of the valid categories>",
  "priority": "<one of the valid priorities>",
  "reason": "<1-2 sentence explanation of priority scoring>"
}"""

    user_prompt = f"Subject: {subject}\nDescription: {description}{book_context}"
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    llm_output = await call_openai_compatible_api(messages, temperature=0.1)
    if llm_output:
        try:
            cleaned = llm_output.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                cleaned = cleaned.removeprefix("json").strip()

            parsed = json.loads(cleaned)
            category = parsed.get("category", "")
            priority = parsed.get("priority", "")
            reason = parsed.get(
                "reason", "AI-determined classification based on query urgency."
            )

            if category in VALID_CATEGORIES and priority in VALID_PRIORITIES:
                return {
                    "category": category,
                    "priority": priority,
                    "reason": reason,
                }
        except Exception as e:
            logger.warning(f"Error parsing LLM JSON triage: {e}, text: {llm_output}")

    return fallback_triage(subject, description)


def fallback_draft(
    ticket_data: dict[str, Any],
    author_data: dict[str, Any],
    book_data: dict[str, Any] | None,
) -> str:
    author_name = author_data.get("name", "Author")
    category = ticket_data.get("category", "General Inquiry")
    book_title = book_data.get("title") if book_data else "your book"

    if category == "Royalty & Payments":
        if (
            book_data
            and book_data.get("royalty_pending", 0) < 1000
            and book_data.get("royalty_pending", 0) > 0
        ):
            pending = book_data.get("royalty_pending")
            return (
                f"Dear {author_name},\n\n"
                f"Thank you for reaching out regarding your royalties for '{book_title}'.\n\n"
                f"I completely understand your desire for clarity on your payout. Looking at your account, your accumulated pending royalty currently stands at ₹{pending:,.2f}. "
                f"As per BookLeaf's Royalty Policy, payouts are processed quarterly via direct bank transfer, with a minimum payout threshold of ₹1,000. Because your current balance is below this threshold, it will safely roll over into the upcoming quarter until the threshold is met.\n\n"
                f"You can review your detailed sales and earnings breakdown directly on your dashboard. Please verify that your bank details are up to date in your profile. If you have any questions about specific platform sales, please let me know and I will gladly provide a line-by-line statement.\n\n"
                f"Warm regards,\nBookLeaf Author Support Team"
            )
        return (
            f"Dear {author_name},\n\n"
            f"Thank you for reaching out regarding your royalties for '{book_title}'.\n\n"
            f"I acknowledge your concern regarding payment timing. BookLeaf follows an 80/20 royalty split calculated quarterly, with payouts disbursed within 45 days of the quarter ending via direct bank transfer.\n\n"
            f"I am actively escalating your account details to our finance team to check the latest disbursement schedule for your earnings. We will provide you with a concrete update within 48 hours.\n\n"
            f"In the meantime, please confirm that your bank details on your author profile are complete and accurate.\n\n"
            f"Warm regards,\nBookLeaf Author Support Team"
        )

    if category == "ISBN & Metadata Issues":
        return (
            f"Dear {author_name},\n\n"
            f"Thank you for alerting us to the ISBN discrepancy regarding '{book_title}'.\n\n"
            f"We treat any ISBN or catalog data inconsistency with utmost seriousness. I have immediately escalated this issue to our senior production and catalog team. We are cross-referencing our imprint registry with platform listings to correct any erroneous data.\n\n"
            f"Our team will resolve this and provide you with confirmation within 48 hours. No action is required from your side at this moment.\n\n"
            f"Warm regards,\nBookLeaf Author Support Team"
        )

    if category == "Printing & Quality":
        return (
            f"Dear {author_name},\n\n"
            f"I am truly sorry to hear that the print quality of your author copies for '{book_title}' did not meet expectations.\n\n"
            f"BookLeaf takes pride in our printing standards, and we sincerely apologize for this frustration. Could you please reply with photos clearly showing the defects (such as blurry pages, cover misalignment, or binding flaws)?\n\n"
            f"Once our quality team inspects the photos, we will immediately arrange a 100% free reprint of your copies. Our standard print turnaround is 5–7 business days, and we will expedite your replacement shipment.\n\n"
            f"Warm regards,\nBookLeaf Author Support Team"
        )

    if category == "Distribution & Availability":
        return (
            f"Dear {author_name},\n\n"
            f"Thank you for contacting us about the availability of '{book_title}' on online platforms.\n\n"
            f"When a published book shows as 'Currently Unavailable' or out of stock, it is typically a stock synchronization delay between our distributor feed and the platform's catalog servers.\n\n"
            f"I have triggered an immediate catalog and inventory re-sync with our distribution team. These updates normally reflect on Amazon and Flipkart within 24 to 48 hours. I will monitor this listing closely and verify when it is back live.\n\n"
            f"Warm regards,\nBookLeaf Author Support Team"
        )

    if category == "Book Status & Production Updates":
        current_status = (
            book_data.get("status", "in production") if book_data else "in production"
        )
        return (
            f"Dear {author_name},\n\n"
            f"Thank you for checking in on the progress of '{book_title}'.\n\n"
            f"Your manuscript is currently in the **{current_status}** stage. We work diligently through each phase—Cover Design, Typesetting, Proofreading, and ISBN assignment—to ensure your book receives the highest level of care.\n\n"
            f"I am following up with your assigned production editor to ensure there are no bottlenecks and to obtain an updated timeline for the next milestone. We will update you with exact next steps within 24–48 hours.\n\n"
            f"Warm regards,\nBookLeaf Author Support Team"
        )

    return (
        f"Dear {author_name},\n\n"
        f"Thank you for reaching out to BookLeaf Author Support.\n\n"
        f"We have received your query and I am reviewing the details of your account to provide you with the most accurate assistance. Our team will get back to you with a comprehensive update shortly.\n\n"
        f"If you have any additional details or files to share in the meantime, please feel free to reply directly to this ticket.\n\n"
        f"Warm regards,\nBookLeaf Author Support Team"
    )


async def draft_ticket_response(
    ticket_data: dict[str, Any],
    author_data: dict[str, Any],
    book_data: dict[str, Any] | None,
    message_history: list[dict[str, Any]],
) -> str:
    book_details = "None (General/Account-level inquiry)"
    if book_data:
        book_details = (
            f"Title: {book_data.get('title')}\n"
            f"ISBN: {book_data.get('isbn')}\n"
            f"Status: {book_data.get('status')}\n"
            f"MRP: ₹{book_data.get('mrp')}\n"
            f"Total Copies Sold: {book_data.get('total_copies_sold', 0)}\n"
            f"Total Royalty Earned: ₹{book_data.get('total_royalty_earned', 0)}\n"
            f"Royalty Paid: ₹{book_data.get('royalty_paid', 0)}\n"
            f"Royalty Pending: ₹{book_data.get('royalty_pending', 0)}\n"
            f"Print Partner: {book_data.get('print_partner')}\n"
            f"Available On: {', '.join(book_data.get('available_on', []))}"
        )

    author_details = (
        f"Name: {author_data.get('name')}\n"
        f"Email: {author_data.get('email')}\n"
        f"Phone: {author_data.get('phone')}\n"
        f"City: {author_data.get('city')}\n"
        f"Joined Date: {author_data.get('joined_date')}"
    )

    recent_messages = []
    for m in message_history[-4:]:
        role = "Author" if m.get("sender_role") == "author" else "BookLeaf Support"
        recent_messages.append(f"{role}: {m.get('content')}")

    history_str = (
        "\n".join(recent_messages)
        if recent_messages
        else f"Author Query: {ticket_data.get('description')}"
    )

    system_prompt = f"""{BOOKLEAF_KNOWLEDGE_BASE}

=== TASK ===
Draft an empathetic, professional, and policy-grounded email response to the author from the BookLeaf Operations Team.
The draft will be reviewed and edited by an admin before sending.

Guidelines:
1. Address the author warmly by name.
2. Directly acknowledge and validate their specific concern.
3. Incorporate actual facts from the Author & Book context.
4. Accurately apply BookLeaf policies.
5. If something is BookLeaf's delay or fault, apologize sincerely and own it directly.
6. Provide concrete timelines and end with a clear next step.
7. Sign off as 'Warm regards,\nBookLeaf Author Support Team'.
"""

    user_prompt = f"""Author Profile:
{author_details}

Linked Book Information:
{book_details}

Ticket Subject: {ticket_data.get("subject")}
Ticket Category: {ticket_data.get("category")}
Ticket Priority: {ticket_data.get("priority")}

Conversation History:
{history_str}
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    llm_output = await call_openai_compatible_api(messages, temperature=0.3)
    if llm_output and len(llm_output.strip()) > 20:
        return llm_output.strip()

    return fallback_draft(ticket_data, author_data, book_data)
