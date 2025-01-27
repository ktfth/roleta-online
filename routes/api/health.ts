import { HandlerContext } from "$fresh/server.ts";

export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: performance.now(),
    version: Deno.env.get("DENO_DEPLOYMENT_ID") || "development",
  };

  return new Response(JSON.stringify(health), {
    headers: { "Content-Type": "application/json" },
  });
}; 