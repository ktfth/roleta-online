import { HandlerContext } from "$fresh/server.ts";
import { rooms } from "../../../utils/rooms.ts";

export const handler = async (req: Request, ctx: HandlerContext): Response => {
  const { id } = ctx.params;
  const room = rooms.get(id);

  if (!room) {
    return new Response(JSON.stringify({ 
      error: "Sala não encontrada",
      message: "Aguarde o criador iniciar a sala."
    }), {
      status: 404,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Retorna apenas informações públicas da sala
  return new Response(JSON.stringify({
    id: room.id,
    isPrivate: room.isPrivate,
    userCount: room.users.size,
    hasCamera: room.hasCamera,
    isTransmitting: room.isTransmitting,
    userName: room.userName,
  }), {
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}; 