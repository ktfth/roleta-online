import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req) {
    // Gera um ID aleatório para a sala
    const randomId = Math.random().toString(36).substring(2, 8);
    
    // Redireciona para a sala com o ID aleatório
    const url = new URL(req.url);
    return new Response("", {
      status: 307,
      headers: {
        "Location": `/chat/${randomId}`,
      },
    });
  },
}; 