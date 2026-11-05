import asyncio
import logging
from app.database.session import sync_engine, AsyncSessionLocal
from app.database.base import Base
from app.services.seeder import seed_initial_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prometheus9.init")

def init_db():
    logger.info("Initializing SQLite database tables via SQLAlchemy metadata...")
    Base.metadata.create_all(bind=sync_engine)
    logger.info("Database tables initialized successfully.")

async def run_seed():
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)

if __name__ == "__main__":
    init_db()
    asyncio.run(run_seed())
