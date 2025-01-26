import { HandlerContext } from "$fresh/server.ts";
import { getRooms } from "../../utils/rooms.ts";

interface Room {
  id: string;
  users: Set<WebSocket>;
  hasCamera: boolean;
  createdAt: number;
  isTransmitting: boolean;
  userName?: string;
}

const rooms = new Map<string, Room>();

export const handler = async (req: Request, _ctx: HandlerContext): Response => {
  if (req.method === "GET") {
    const activeRooms = getRooms();

    return new Response(JSON.stringify(activeRooms), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  }

  return new Response("Método não permitido", { status: 405 });
}; 