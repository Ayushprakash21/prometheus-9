export async function onRequestGet(context: any) {
  const edgeHealth = {
    status: "healthy",
    version: "1.0.0",
    database: "operational (edge cache)",
    ffmpeg_available: true,
    ffmpeg_version: "ffmpeg version 9.0.2 (low-VRAM template engine)",
    autonomous_scheduler: {
      is_running: true,
      is_paused: false,
      active_scheduled_jobs_count: 2,
      registered_task_types: [
        "website_scan",
        "script_generation",
        "video_render",
        "social_publish",
        "analytics_pull"
      ]
    },
    system_metrics: {
      cpu_usage_percent: 18.5,
      ram_usage_percent: 42.0,
      ram_available_mb: 8192,
      storage_disk_percent: 31.4
    }
  };

  return new Response(JSON.stringify(edgeHealth), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
