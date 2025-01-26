import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req) {
    // Gera um ID único para a nova sala
    const newRoomId = crypto.randomUUID().substring(0, 8);
    
    // Redireciona para a sala recém-criada
    const url = new URL(req.url);
    return new Response("", {
      status: 307,
      headers: {
        "Location": `/chat/${newRoomId}`,
      },
    });
  },
}; 