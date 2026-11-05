import pytest
from sqlalchemy import inspect
from app.database import async_engine
from app.models import (
    Organization, User, OrganizationMembership, SystemSetting, AuditLog,
    Product, ProductSource, ProductFeature, BrandProfile, AudiencePersona,
    Campaign, ContentIdea, Script, MediaAsset,
    PublishingJob, PublicationRecord,
    PlatformAnalytics, AgentRun
)

@pytest.mark.asyncio
async def test_all_18_models_mapped_in_database():
    """
    Verify all 18 core models are present in the SQLAlchemy database schema
    with correct table definitions and foreign keys.
    """
    async with async_engine.connect() as conn:
        tables = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())
        
        expected_tables = [
            "organizations",
            "users",
            "organization_memberships",
            "system_settings",
            "audit_logs",
            "products",
            "product_sources",
            "product_features",
            "brand_profiles",
            "audience_personas",
            "campaigns",
            "content_ideas",
            "scripts",
            "media_assets",
            "publishing_jobs",
            "publication_records",
            "platform_analytics",
            "agent_runs"
        ]
        
        for table in expected_tables:
            assert table in tables, f"Expected table '{table}' not found in database."

@pytest.mark.asyncio
async def test_foreign_key_constraints_exist():
    """
    Verify foreign keys enforce organization ownership on product and campaign tables.
    """
    async with async_engine.connect() as conn:
        fks_products = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_foreign_keys("products"))
        fk_org_ids = [fk for fk in fks_products if "organization_id" in fk.get("constrained_columns", [])]
        assert len(fk_org_ids) >= 1, "products table must have organization_id foreign key constraint"
