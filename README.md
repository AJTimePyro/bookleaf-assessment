# BookLeaf Author Support Portal

A support portal for BookLeaf Publishing with AI ticket triage and response drafting. Authors use a dashboard to track book performance and raise queries. Operations staff use a separate workspace to triage tickets, override AI decisions, and reply to authors.

---

## Live Demo and Test Credentials

- Live URL: `https://bookleaf-assessment.vercel.app/`
- Swagger docs (local backend): `http://localhost:8000/docs`

| Role | Email | Password | Scenario |
|---|---|---|---|
| Author | `priya.sharma@email.com` | `password123` | 2 published titles, ₹11.9k royalties, active ISBN discrepancy |
| Author | `rohit.kapoor@email.com` | `password123` | Bestseller (1,200+ sold), open print defect ticket |
| Author | `diya.chatterjee@email.com` | `password123` | ₹850 pending royalty, below the ₹1,000 rollover threshold |
| Admin | `admin@bookleaf.com` | `admin123` | Ticket queue, overrides, AI drafts, staff notes |

All 10 authors in `bookleaf_sample_data.json` can log in with `password123`.

---

## Local Setup

You need Node.js 20+ and Python 3.11+.

### Backend

```bash
cd backend

# With uv
uv sync
uv run uvicorn main:app --reload --port 8000

# Or with pip
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. On startup it creates the SQLite database (`bookleaf.db`) and seeds it from `bookleaf_sample_data.json`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The web UI runs at `http://localhost:3000`.

---

## Architecture Decisions

### FastAPI and Next.js

FastAPI serves async REST endpoints and generates the OpenAPI docs. The frontend uses the Next.js App Router with Tailwind CSS, and both portals share it.

### SQLite and SQLAlchemy 2.0

SQLite keeps local evaluation simple: one file, no setup. The models use standard foreign keys and cascade rules, so moving to PostgreSQL only requires changing the connection string.

### Polling instead of WebSockets

A React hook polls every 3.5 seconds and pauses while the browser tab is hidden (`document.visibilityState`). This keeps conversations current without WebSocket reconnection logic, state reconciliation, or proxy configuration.

### Data isolation and RBAC

Access control is enforced in the middleware and in the database queries. Authors see only their own books and tickets. Admin internal notes are left out of every author-facing response.

---

## AI Integration

### Model configuration

The backend works with any OpenAI-compatible completions API, configured in `backend/.env`:

```env
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=qwen3.5
LLM_TIMEOUT=15.0
```

Ollama (`qwen2.5` or `qwen3.5`) is the local default. Groq (`llama-3.3-70b-versatile`) and OpenAI (`gpt-4o-mini`) also work. API keys stay in server environment variables and are never sent to the client.

### Prompt grounding

The prompts encode BookLeaf's operating policies:

- Royalties: 80/20 profit split, calculated on net profit after print cost, platform fee, and shipping. Payouts are quarterly, within 45 days. Balances under ₹1,000 roll over.
- ISBN issues: high or critical priority, with a 48-hour resolution commitment.
- Print quality: apologize, ask for photos of the defect, and commit to a free reprint within 5 to 7 business days.
- Distribution: Amazon and Flipkart stock availability issues get a catalog re-sync within 24 to 48 hours.
- Tone: write as a partner who cares. Cite specific numbers and dates, own delays directly, and end with clear next steps.

### Fallback when the LLM is unavailable

If the LLM endpoint is unreachable, offline, or takes longer than 15 seconds, the backend falls back instead of returning an error.

- Triage: keyword heuristics assign a category and priority.
- Drafts: a template fills in the author's and book's real data and states the relevant policy. For example, it explains rollover when the pending balance is under ₹1,000.

Ticket creation and manual admin replies never depend on the LLM.

### Token use

The triage prompt requires strict JSON output, about 50 completion tokens. Draft generation sends only the last 4 messages and a compact summary of author and book metadata, not the full catalog.

---

## API Summary

Interactive docs for the hosted backend: `https://bookleaf-assessment.onrender.com/docs`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates a user and returns a JWT and profile |
| `GET` | `/api/auth/me` | Authenticated | Current user profile |
| `GET` | `/api/auth/demo-users` | Public | Pre-seeded test accounts |
| `GET` | `/api/books` | Authenticated | Book list, scoped to the author, or filterable for admins |
| `GET` | `/api/tickets` | Authenticated | Ticket queue, filterable by status, category, priority, date, and search |
| `POST` | `/api/tickets` | Author | Submits a query and triggers AI triage |
| `GET` | `/api/tickets/{id}` | Authenticated | Ticket details and messages (notes hidden from authors) |
| `PATCH` | `/api/tickets/{id}` | Admin | Overrides category, priority, status, or assignee |
| `POST` | `/api/tickets/{id}/messages` | Authenticated | Sends a conversation reply |
| `POST` | `/api/tickets/{id}/notes` | Admin | Adds a private staff note |
| `POST` | `/api/tickets/{id}/ai-draft` | Admin | Generates a draft reply grounded in the policy knowledge base |

---

## Known Limitations and Roadmap

1. Policy retrieval: the policies currently live in the prompt as static text. As they grow, move them into a vector store (pgvector or Qdrant) and retrieve only the relevant clauses.
2. Background processing: triage and draft generation run inside the request. A Celery and Redis worker would bring ticket creation under 50 ms.
3. Proper Authentication with 2FA: the current JWT implementation is a placeholder. In production, use a secure identity provider (Auth0, Supabase, or Cognito) with 2FA.
