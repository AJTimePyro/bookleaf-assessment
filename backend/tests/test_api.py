import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from starlette.testclient import TestClient

from main import app

client = TestClient(app)


def test_full_flow():
    r = client.get("/api/health")
    assert r.status_code == 200, r.text
    print("✓ Health check passed")

    r = client.get("/api/auth/demo-users")
    assert r.status_code == 200
    demo_users = r.json()
    assert len(demo_users) >= 4
    print(f"✓ Demo users retrieved ({len(demo_users)})")

    r = client.post(
        "/api/auth/login",
        json={"email": "priya.sharma@email.com", "password": "password123"},
    )
    assert r.status_code == 200
    author_auth = r.json()
    author_token = author_auth["access_token"]
    author_headers = {"Authorization": f"Bearer {author_token}"}
    print(f"✓ Author logged in: {author_auth['user']['name']}")

    r = client.get("/api/books", headers=author_headers)
    assert r.status_code == 200
    books = r.json()
    assert len(books) == 2
    assert books[0]["author_id"] == "AUTH001"
    print(f"✓ Author books retrieved: {[b['title'] for b in books]}")

    new_ticket_payload = {
        "book_id": "BK001",
        "subject": "Missing author copies for promotion event",
        "description": "I ordered 10 copies 2 weeks ago but haven't received them yet. Our local launch event is this weekend.",
    }
    r = client.post("/api/tickets", json=new_ticket_payload, headers=author_headers)
    assert r.status_code == 200
    new_ticket = r.json()
    assert new_ticket["category"] is not None
    assert new_ticket["priority"] in ["Critical", "High", "Medium", "Low"]
    ticket_id = new_ticket["id"]
    print(
        f"✓ Author created ticket: #{new_ticket['ticket_number']} | AI Category: {new_ticket['category']} | Priority: {new_ticket['priority']}"
    )

    r = client.post(
        "/api/auth/login",
        json={"email": "admin@bookleaf.com", "password": "admin123"},
    )
    assert r.status_code == 200
    admin_auth = r.json()
    admin_token = admin_auth["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("✓ Admin logged in")

    r = client.get("/api/tickets", headers=admin_headers)
    assert r.status_code == 200
    admin_queue = r.json()
    assert len(admin_queue) >= 5
    print(f"✓ Admin queue retrieved ({len(admin_queue)} tickets)")

    r = client.get("/api/tickets?date_filter=today", headers=admin_headers)
    assert r.status_code == 200
    today_tickets = r.json()
    print(f"✓ Date filter passed ({len(today_tickets)} tickets created today)")

    r = client.post(f"/api/tickets/{ticket_id}/ai-draft", headers=admin_headers)
    assert r.status_code == 200
    draft_res = r.json()
    assert "draft" in draft_res
    print(
        f"✓ AI Draft response generated (preview: {draft_res['draft'][:60].strip()}...)"
    )

    patch_payload = {"priority": "Critical", "category": "Printing & Quality"}
    r = client.patch(
        f"/api/tickets/{ticket_id}", json=patch_payload, headers=admin_headers
    )
    assert r.status_code == 200
    updated_ticket = r.json()
    assert updated_ticket["priority"] == "Critical"
    assert updated_ticket["category"] == "Printing & Quality"
    print("✓ Admin override priority and category succeeded")

    note_payload = {
        "content": "Called warehouse lead Vikram. Shipment batch dispatched via BlueDart AWB#882910."
    }
    r = client.post(
        f"/api/tickets/{ticket_id}/notes", json=note_payload, headers=admin_headers
    )
    assert r.status_code == 200
    ticket_with_note = r.json()
    assert len(ticket_with_note["internal_notes"]) >= 1
    print("✓ Admin internal note added")

    r = client.get(f"/api/tickets/{ticket_id}", headers=author_headers)
    assert r.status_code == 200
    author_view = r.json()
    assert len(author_view["internal_notes"]) == 0
    print(
        "✓ Confirmed: Author view does NOT contain internal notes (Security verified)"
    )

    print("\n🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_full_flow()
