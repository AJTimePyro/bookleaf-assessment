import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.connection import Base, SessionLocal, engine
from database.seed import seed_database
from routers import auth_routes, book_routes, ticket_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    logger.info("Checking and running seed database...")
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield
    logger.info("Shutting down BookLeaf application.")


app = FastAPI(
    title="BookLeaf Author Support & Communication Portal API",
    version="1.0.0",
    description="Backend API powering the author and admin portals with AI-assisted triage and response drafting.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://bookleaf-assessment.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api")
app.include_router(book_routes.router, prefix="/api")
app.include_router(ticket_routes.router, prefix="/api")


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "BookLeaf Author Support & Communication Portal API",
        "documentation": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
