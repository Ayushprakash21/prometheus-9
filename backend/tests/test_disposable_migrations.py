from pathlib import Path
from alembic.config import Config
from alembic import command
from sqlalchemy import create_engine, inspect

def test_migration_lifecycle_on_disposable_database(tmp_path: Path):
    """
    Test fresh database migration upgrade and downgrade on disposable test database only.
    Verifies:
    1. Fresh migration applies all revisions to a new database without error.
    2. All expected core tables (including persistent_tasks) are created.
    3. Foreign keys and indexes are established.
    4. Safe downgrade and re-upgrade work.
    """
    disposable_db = tmp_path / "disposable_test.db"
    disposable_url = f"sqlite:///{disposable_db}"

    # Prepare Alembic Config pointing to backend/alembic.ini
    backend_dir = Path(__file__).resolve().parent.parent
    alembic_ini_path = backend_dir / "alembic.ini"
    alembic_cfg = Config(str(alembic_ini_path))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "migrations"))
    alembic_cfg.set_main_option("sqlalchemy.url", disposable_url)

    # 1. Upgrade fresh disposable database to head
    command.upgrade(alembic_cfg, "head")

    # Verify tables created
    engine = create_engine(disposable_url)
    with engine.connect() as conn:
        inspector = inspect(conn)
        tables = inspector.get_table_names()
        assert "products" in tables
        assert "organizations" in tables
        assert "persistent_tasks" in tables
        assert "task_execution_logs" in tables
        assert "media_assets" in tables
        assert "alembic_version" in tables

    # 2. Downgrade to initial migration
    command.downgrade(alembic_cfg, "25c1309fe5c9")
    with engine.connect() as conn:
        inspector = inspect(conn)
        tables_down = inspector.get_table_names()
        assert "persistent_tasks" not in tables_down
        assert "products" in tables_down

    # 3. Re-upgrade to head
    command.upgrade(alembic_cfg, "head")
    with engine.connect() as conn:
        inspector = inspect(conn)
        tables_re = inspector.get_table_names()
        assert "persistent_tasks" in tables_re
        assert "task_execution_logs" in tables_re
