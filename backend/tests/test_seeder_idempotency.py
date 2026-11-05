import pytest
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.seeder import seed_initial_data, DEFAULT_ORG_SLUG, FOUNDER_EMAIL
from app.models.system import Organization, User
from app.models.organization import Product, ProductFeature, BrandProfile, AudiencePersona

@pytest.mark.asyncio
async def test_seeder_idempotency_does_not_duplicate(db_session: AsyncSession):
    """
    Verify that running the seeder multiple times produces zero duplicate records.
    """
    # 1. Run seeder
    await seed_initial_data(db_session)
    await db_session.commit()
    
    # 2. Count records
    orgs_count_1 = (await db_session.execute(select(func.count(Organization.id)).where(Organization.slug == DEFAULT_ORG_SLUG))).scalar()
    users_count_1 = (await db_session.execute(select(func.count(User.id)).where(User.email == FOUNDER_EMAIL))).scalar()
    orion_count_1 = (await db_session.execute(select(func.count(Product.id)).where(Product.slug == "orion-9"))).scalar()
    applywise_count_1 = (await db_session.execute(select(func.count(Product.id)).where(Product.slug == "applywise-ai"))).scalar()
    
    assert orgs_count_1 == 1
    assert users_count_1 == 1
    assert orion_count_1 == 1
    assert applywise_count_1 == 1

    # 3. Run seeder again
    await seed_initial_data(db_session)
    await db_session.commit()

    # 4. Count records again and ensure identical
    orgs_count_2 = (await db_session.execute(select(func.count(Organization.id)).where(Organization.slug == DEFAULT_ORG_SLUG))).scalar()
    users_count_2 = (await db_session.execute(select(func.count(User.id)).where(User.email == FOUNDER_EMAIL))).scalar()
    orion_count_2 = (await db_session.execute(select(func.count(Product.id)).where(Product.slug == "orion-9"))).scalar()
    applywise_count_2 = (await db_session.execute(select(func.count(Product.id)).where(Product.slug == "applywise-ai"))).scalar()

    assert orgs_count_2 == 1
    assert users_count_2 == 1
    assert orion_count_2 == 1
    assert applywise_count_2 == 1

@pytest.mark.asyncio
async def test_seeder_zero_unverified_claims(db_session: AsyncSession):
    """
    Verify no fake revenue, fake user counts, or fake pricing numbers were seeded.
    """
    orion = (await db_session.execute(select(Product).where(Product.slug == "orion-9"))).scalar_one()
    applywise = (await db_session.execute(select(Product).where(Product.slug == "applywise-ai"))).scalar_one()

    # Verify no invented revenue / customer claims in descriptions
    combined_desc = (orion.description + " " + applywise.description).lower()
    assert "$100k" not in combined_desc
    assert "1,000,000 users" not in combined_desc
    assert "$500m" not in combined_desc
    assert "fortune 500" not in combined_desc
