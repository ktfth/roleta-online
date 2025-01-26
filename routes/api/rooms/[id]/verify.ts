import { HandlerContext } from "$fresh/server.ts";
import { rooms } from "../../../../utils/rooms.ts";

export const handler = async (req: Request, ctx: HandlerContext): Response => {
  if (req.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  const { id } = ctx.params;
  const room = rooms.get(id);

  if (!room) {
    return new Response(JSON.stringify({ error: "Sala não encontrada" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { password } = body;

    if (!room.isPrivate) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!password || password !== room.password) {
      return new Response(JSON.stringify({ error: "Senha incorreta" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro ao processar requisição" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 