export async function onRequestGet(context: any) {
  const roster = {
    is_autonomous_paused: false,
    agents: [
      { name: "Marketing Intelligence Agent", category: "Intelligence", description: "Scans product websites, documentation, and extract ground-truth product facts.", status: "idle" },
      { name: "Trend Intelligence Agent", category: "Intelligence", description: "Monitors market trends, keywords, and industry news.", status: "idle" },
      { name: "Marketing Strategist Agent", category: "Strategy", description: "Develops objective-aligned campaign architectures and target audience roadmaps.", status: "idle" },
      { name: "Scriptwriter Agent", category: "Creative", description: "Crafts compelling video scripts adhering strictly to verified product capabilities.", status: "idle" },
      { name: "Storyboard Agent", category: "Creative", description: "Breaks scripts into timed visual scenes and shot prompts.", status: "idle" },
      { name: "Voice Production Agent", category: "Audio", description: "Generates natural speech voiceovers with local or cloud TTS engines.", status: "idle" },
      { name: "Video Production Agent", category: "Video", description: "Coordinates FFmpeg video rendering, aspect ratios, overlays, and transitions.", status: "idle" },
      { name: "Graphics & Thumbnail Agent", category: "Creative", description: "Generates high-contrast, brand-compliant social thumbnails and banners.", status: "idle" },
      { name: "Subtitle Agent", category: "Audio", description: "Transcribes speech and aligns timed SRT/VTT captions.", status: "idle" },
      { name: "SEO & Metadata Agent", category: "Optimization", description: "Generates search-optimized titles, descriptions, and tag sets.", status: "idle" },
      { name: "Quality Assurance Agent", category: "Governance", description: "Validates factual fidelity and ensures zero-hallucination standards.", status: "idle" },
      { name: "Publishing Agent", category: "Distribution", description: "Handles authorized OAuth social API publishing and captures post IDs.", status: "idle" },
      { name: "Analytics Agent", category: "Measurement", description: "Retrieves real performance telemetry from platform APIs.", status: "idle" },
      { name: "Growth Optimization Agent", category: "Optimization", description: "Analyzes conversion attribution and recommends campaign iterations.", status: "idle" },
      { name: "Brand & Compliance Agent", category: "Governance", description: "Enforces Charcoal & Copper palette, prohibited claim filtering, and disclaimers.", status: "idle" }
    ]
  };

  return new Response(JSON.stringify(roster), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
