import asyncio
import logging
from sqlalchemy import select
from app.database import Base, sync_engine, AsyncSessionLocal
from app.models import (
    Organization, Product, ProductFeature, BrandProfile,
    AudiencePersona, SystemSetting, SocialAccount
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prometheus9.init")

def init_db():
    logger.info("Creating SQLite database tables from SQLAlchemy metadata...")
    Base.metadata.create_all(bind=sync_engine)
    logger.info("Database tables initialized successfully.")

async def seed_initial_products():
    async with AsyncSessionLocal() as session:
        # 1. Ensure master organization exists
        org_result = await session.execute(select(Organization).where(Organization.slug == "prometheus-org"))
        org = org_result.scalar_one_or_none()
        if not org:
            org = Organization(
                name="PROMETHEUS-9 Master Portfolio",
                slug="prometheus-org"
            )
            session.add(org)
            await session.commit()
            await session.refresh(org)
            logger.info(f"Created organization: {org.name}")

        # 2. Product 1: ORION-9
        orion_result = await session.execute(select(Product).where(Product.slug == "orion-9"))
        orion = orion_result.scalar_one_or_none()
        if not orion:
            orion = Product(
                organization_id=org.id,
                name="ORION-9",
                slug="orion-9",
                category="Enterprise Supply Chain",
                tagline="AI-Native Supply Chain Operating System",
                description="Autonomous multi-tier supply chain orchestration, inventory balancing, and disruption prediction for global enterprise manufacturers.",
                website_url="https://orion9.ai",
                primary_objective="qualified_leads",
                is_active=True
            )
            session.add(orion)
            await session.commit()
            await session.refresh(orion)
            
            # Orion Brand Profile
            session.add(BrandProfile(
                product_id=orion.id,
                tone_of_voice="Enterprise, Authoritative, Mission-Critical, Precision",
                primary_color="#A16C50",
                secondary_color="#202221",
                accent_color="#C9B49B",
                do_not_mention_claims=["Consumer retail discounts", "Personal resume writing"],
                mandatory_disclaimers=["Enterprise tier terms and SLA subject to contract."]
            ))
            
            # Orion Audience Personas
            session.add(AudiencePersona(
                product_id=orion.id,
                title="VP of Global Supply Chain",
                role_description="Enterprise executive managing cross-border logistics, multi-tier suppliers, and inventory exposure.",
                pain_points=["Unpredicted supply disruptions", "Excess buffer inventory carrying costs", "Siloed vendor data"],
                desired_outcomes=["Autonomous disruption mitigation", "99.4% order fill rate", "Real-time visibility"],
                preferred_channels=["linkedin", "youtube"]
            ))
            
            # Orion Verified Features
            session.add_all([
                ProductFeature(
                    product_id=orion.id,
                    name="Autonomous Multi-Tier Inventory Balancing",
                    description="Dynamically rebalances SKU levels across regional DCs using probabilistic demand modeling.",
                    benefit_statement="Reduces safety-stock holding cost by 24% without stockouts.",
                    is_verified=True
                ),
                ProductFeature(
                    product_id=orion.id,
                    name="Real-Time Disruption Prediction Engine",
                    description="Correlates geospatial weather, port congestion, and supplier health into proactive rerouting alerts.",
                    benefit_statement="Provides 48-hour advance warning before logistics bottlenecks occur.",
                    is_verified=True
                )
            ])
            logger.info("Seeded initial product: ORION-9")

        # 3. Product 2: ApplyWise AI
        applywise_result = await session.execute(select(Product).where(Product.slug == "applywise-ai"))
        applywise = applywise_result.scalar_one_or_none()
        if not applywise:
            applywise = Product(
                organization_id=org.id,
                name="ApplyWise AI",
                slug="applywise-ai",
                category="Career & HR Technology",
                tagline="Intelligent Job Discovery & Zero-Hallucination Resume Optimization",
                description="Career operating system uniting verified live vacancy ingestion, ATS-tailored resume generation, and context-aware interview coaching.",
                website_url="https://applywise.ai",
                primary_objective="registrations",
                is_active=True
            )
            session.add(applywise)
            await session.commit()
            await session.refresh(applywise)
            
            # ApplyWise Brand Profile
            session.add(BrandProfile(
                product_id=applywise.id,
                tone_of_voice="Empathetic, Truth-Centric, Sophisticated, Actionable",
                primary_color="#A16C50",
                secondary_color="#202221",
                accent_color="#C9B49B",
                do_not_mention_claims=["Guaranteed 100% job offer", "Fabricated resume credentials", "Supply chain logistics"],
                mandatory_disclaimers=["ApplyWise AI strictly adheres to the Zero-Hallucination Factual Standard."]
            ))
            
            # ApplyWise Audience Personas
            session.add(AudiencePersona(
                product_id=applywise.id,
                title="Mid-Career Software Engineer",
                role_description="Experienced engineer navigating opaque ATS filters and seeking verified resume match scoring.",
                pain_points=["Resume rejection by automated filters", "Time-consuming manual tailoring", "Hallucinatory AI tools"],
                desired_outcomes=["High-fidelity interview rate", "Verified career trajectory match", "Tailored ATS resumes"],
                preferred_channels=["youtube", "linkedin", "x"]
            ))
            
            # ApplyWise Verified Features
            session.add_all([
                ProductFeature(
                    product_id=applywise.id,
                    name="Zero-Hallucination Resume Optimization",
                    description="Generates ATS-aligned resumes strictly grounded in candidate-verified employment facts.",
                    benefit_statement="Eliminates ATS rejection while preventing fabricated credentials.",
                    is_verified=True
                ),
                ProductFeature(
                    product_id=applywise.id,
                    name="Live Vacancy Multi-Source Ingestion",
                    description="Real-time multi-connector aggregation from verified global job boards.",
                    benefit_statement="Direct access to live, non-scam opportunities without spam.",
                    is_verified=True
                )
            ])
            logger.info("Seeded initial product: ApplyWise AI")

        # 4. Default System Settings
        settings_result = await session.execute(select(SystemSetting).where(SystemSetting.key == "brand_identity"))
        if not settings_result.scalar_one_or_none():
            session.add(SystemSetting(
                key="brand_identity",
                value={
                    "palette": {
                        "obsidian_charcoal": "#202221",
                        "graphite": "#414542",
                        "burnished_copper": "#A16C50",
                        "champagne_beige": "#C9B49B",
                        "warm_ivory": "#EEE8DE"
                    },
                    "edition": "Charcoal & Copper Edition",
                    "monogram": "P9"
                },
                description="Locked official brand identity system"
            ))

        await session.commit()
        logger.info("Seed completed successfully.")

if __name__ == "__main__":
    init_db()
    asyncio.run(seed_initial_products())
