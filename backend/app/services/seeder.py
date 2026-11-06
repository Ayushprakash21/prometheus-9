import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.system import Organization, User, OrganizationMembership, SystemSetting
from app.models.organization import Product, ProductFeature, BrandProfile, AudiencePersona, ProductSource
from app.security.passwords import hash_password

logger = logging.getLogger("prometheus9.seeder")

DEFAULT_ORG_SLUG = "prometheus-org"
DEFAULT_ORG_NAME = "PROMETHEUS-9 Master Portfolio"
FOUNDER_EMAIL = "founder@prometheus9.ai"

async def seed_initial_data(session: AsyncSession):
    """
    Idempotent database seeding for PROMETHEUS-9.
    Never creates duplicates on repeated executions.
    Seeds master organization, default founder user, ORION-9, and ApplyWise AI.
    Zero invented claims, metrics, or revenue figures.
    """
    # 1. Organization
    org_res = await session.execute(select(Organization).where(Organization.slug == DEFAULT_ORG_SLUG))
    org = org_res.scalar_one_or_none()
    if not org:
        org = Organization(
            name=DEFAULT_ORG_NAME,
            slug=DEFAULT_ORG_SLUG
        )
        session.add(org)
        await session.flush()
        logger.info(f"Seeded master organization: {org.name}")

    # 2. Founder User & Membership
    user_res = await session.execute(select(User).where(User.email == FOUNDER_EMAIL))
    founder = user_res.scalar_one_or_none()
    if not founder:
        founder = User(
            email=FOUNDER_EMAIL,
            hashed_password=hash_password("Prometheus9_MasterSecurePassword2026!"),
            full_name="Prometheus-9 Founder",
            is_active=True,
            is_superuser=True
        )
        session.add(founder)
        await session.flush()
        
        membership = OrganizationMembership(
            organization_id=org.id,
            user_id=founder.id,
            role="owner"
        )
        session.add(membership)
        logger.info("Seeded founder administrator account.")

    # 2b. Initial Development Administrator Account (ayush@admin / admin with forced password change)
    INITIAL_ADMIN_EMAIL = "ayush@admin"
    admin_res = await session.execute(select(User).where(User.email == INITIAL_ADMIN_EMAIL))
    admin_user = admin_res.scalar_one_or_none()
    if not admin_user:
        admin_user = User(
            email=INITIAL_ADMIN_EMAIL,
            hashed_password=hash_password("admin"),
            full_name="Ayush Administrator",
            is_active=True,
            is_superuser=True,
            must_change_password=True
        )
        session.add(admin_user)
        await session.flush()
        
        admin_membership = OrganizationMembership(
            organization_id=org.id,
            user_id=admin_user.id,
            role="owner"
        )
        session.add(admin_membership)
        logger.info("Seeded initial administrator account (ayush@admin).")

    # 3. Product 1: ORION-9 (Enterprise Supply Chain Operating System)
    orion_res = await session.execute(
        select(Product).where(Product.organization_id == org.id, Product.slug == "orion-9")
    )
    orion = orion_res.scalar_one_or_none()
    if not orion:
        orion = Product(
            organization_id=org.id,
            name="ORION-9",
            slug="orion-9",
            category="Supply Chain Operating System",
            tagline="AI-Native Supply Chain Operating System",
            description="Autonomous multi-tier supply chain orchestration, inventory balancing, and disruption prediction for global enterprise operations.",
            website_url="https://orion9.ai",
            primary_objective="qualified_leads",
            status="active",
            is_active=True
        )
        session.add(orion)
        await session.flush()

        session.add(BrandProfile(
            organization_id=org.id,
            product_id=orion.id,
            tone_of_voice="Enterprise, Authoritative, Mission-Critical, Precision",
            primary_color="#A16C50",
            secondary_color="#202221",
            accent_color="#C9B49B",
            do_not_mention_claims=["Consumer retail discounts", "Personal resume writing"],
            mandatory_disclaimers=["Enterprise tier terms and SLA subject to contract."]
        ))

        session.add(AudiencePersona(
            organization_id=org.id,
            product_id=orion.id,
            title="VP of Global Supply Chain",
            role_description="Enterprise operations executive managing logistics, suppliers, and inventory exposure.",
            pain_points=["Unpredicted supply disruptions", "Buffer inventory holding costs", "Siloed vendor data"],
            desired_outcomes=["Autonomous disruption mitigation", "Order fill-rate optimization", "Real-time visibility"],
            preferred_channels=["linkedin", "youtube"]
        ))

        session.add_all([
            ProductFeature(
                organization_id=org.id,
                product_id=orion.id,
                name="Autonomous Multi-Tier Inventory Balancing",
                description="Dynamically rebalances SKU levels across regional DCs using probabilistic demand modeling.",
                benefit_statement="Optimizes safety stock holding efficiency without stockouts.",
                is_verified=True
            ),
            ProductFeature(
                organization_id=org.id,
                product_id=orion.id,
                name="Real-Time Disruption Prediction Engine",
                description="Correlates geospatial weather, port congestion, and supplier health into proactive rerouting alerts.",
                benefit_statement="Provides advance warning before logistics bottlenecks occur.",
                is_verified=True
            )
        ])
        logger.info("Seeded initial product: ORION-9")

    # 4. Product 2: ApplyWise AI (Career and Resume Platform)
    applywise_res = await session.execute(
        select(Product).where(Product.organization_id == org.id, Product.slug == "applywise-ai")
    )
    applywise = applywise_res.scalar_one_or_none()
    if not applywise:
        applywise = Product(
            organization_id=org.id,
            name="ApplyWise AI",
            slug="applywise-ai",
            category="Career and Resume Platform",
            tagline="Intelligent Job Discovery & Zero-Hallucination Resume Optimization",
            description="Career operating system uniting verified live vacancy ingestion, ATS-tailored resume generation, and context-aware interview coaching.",
            website_url="https://applywise.ai",
            primary_objective="registrations",
            status="active",
            is_active=True
        )
        session.add(applywise)
        await session.flush()

        session.add(BrandProfile(
            organization_id=org.id,
            product_id=applywise.id,
            tone_of_voice="Empathetic, Truth-Centric, Sophisticated, Actionable",
            primary_color="#A16C50",
            secondary_color="#202221",
            accent_color="#C9B49B",
            do_not_mention_claims=["Guaranteed 100% job offer", "Fabricated resume credentials", "Supply chain logistics"],
            mandatory_disclaimers=["ApplyWise AI strictly adheres to the Zero-Hallucination Factual Standard."]
        ))

        session.add(AudiencePersona(
            organization_id=org.id,
            product_id=applywise.id,
            title="Mid-Career Software Engineer",
            role_description="Experienced engineer navigating opaque ATS filters and seeking verified resume match scoring.",
            pain_points=["Resume rejection by automated filters", "Time-consuming manual tailoring", "Hallucinatory AI tools"],
            desired_outcomes=["High-fidelity interview rate", "Verified career trajectory match", "Tailored ATS resumes"],
            preferred_channels=["youtube", "linkedin", "x"]
        ))

        session.add_all([
            ProductFeature(
                organization_id=org.id,
                product_id=applywise.id,
                name="Zero-Hallucination Resume Optimization",
                description="Generates ATS-aligned resumes strictly grounded in candidate-verified employment facts.",
                benefit_statement="Eliminates ATS rejection while preventing fabricated credentials.",
                is_verified=True
            ),
            ProductFeature(
                organization_id=org.id,
                product_id=applywise.id,
                name="Live Vacancy Multi-Source Ingestion",
                description="Real-time multi-connector aggregation from verified global job boards.",
                benefit_statement="Direct access to live, non-scam opportunities without spam.",
                is_verified=True
            )
        ])
        logger.info("Seeded initial product: ApplyWise AI")

    # 5. System Settings
    sys_res = await session.execute(select(SystemSetting).where(SystemSetting.key == "brand_identity"))
    if not sys_res.scalar_one_or_none():
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
    logger.info("Seeding verified and complete.")
