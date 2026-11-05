export async function onRequestGet(context: any) {
  const products = [
    {
      id: "prod-orion-9",
      organization_id: "org-prometheus",
      name: "ORION-9",
      slug: "orion-9",
      category: "Enterprise Supply Chain",
      tagline: "AI-Native Supply Chain Operating System",
      description: "Autonomous multi-tier supply chain orchestration, inventory balancing, and disruption prediction for global enterprise manufacturers.",
      website_url: "https://orion9.ai",
      primary_objective: "qualified_leads",
      is_active: true,
      created_at: "2026-11-06T00:00:00Z",
      updated_at: "2026-11-06T00:00:00Z",
      features_count: 2,
      sources_count: 1,
      campaigns_count: 1
    },
    {
      id: "prod-applywise-ai",
      organization_id: "org-prometheus",
      name: "ApplyWise AI",
      slug: "applywise-ai",
      category: "Career & HR Technology",
      tagline: "Intelligent Job Discovery & Zero-Hallucination Resume Optimization",
      description: "Career operating system uniting verified live vacancy ingestion, ATS-tailored resume generation, and context-aware interview coaching.",
      website_url: "https://applywise.ai",
      primary_objective: "registrations",
      is_active: true,
      created_at: "2026-11-06T00:00:00Z",
      updated_at: "2026-11-06T00:00:00Z",
      features_count: 2,
      sources_count: 1,
      campaigns_count: 1
    }
  ];

  return new Response(JSON.stringify(products), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
