import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_strict_product_knowledge_isolation(client: AsyncClient, auth_headers: dict):
    # Fetch Orion-9
    orion_res = await client.get("/api/v1/products/orion-9", headers=auth_headers)
    assert orion_res.status_code == 200
    orion_data = orion_res.json()
    
    # Fetch ApplyWise AI
    applywise_res = await client.get("/api/v1/products/applywise-ai", headers=auth_headers)
    assert applywise_res.status_code == 200
    applywise_data = applywise_res.json()
    
    # Verify Orion features have ZERO career/resume mentions
    orion_features_text = " ".join([f["name"] + " " + f["description"] for f in orion_data["features"]]).lower()
    assert "resume" not in orion_features_text
    assert "job seeker" not in orion_features_text
    
    # Verify ApplyWise features have ZERO supply chain/inventory mentions
    applywise_features_text = " ".join([f["name"] + " " + f["description"] for f in applywise_data["features"]]).lower()
    assert "inventory balancing" not in applywise_features_text
    assert "logistics" not in applywise_features_text
    assert "supply chain" not in applywise_features_text
    
    # Verify Brand Profiles are distinct
    assert orion_data["brand_profile"]["primary_color"] == "#A16C50"
    assert "Supply chain" in applywise_data["brand_profile"]["do_not_mention_claims"][2]
    assert "Personal resume writing" in orion_data["brand_profile"]["do_not_mention_claims"][1]
