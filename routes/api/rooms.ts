import { Handlers } from "$fresh/server.ts";
import { getRooms } from "../../utils/rooms.ts";

export const handler: Handlers = {
  GET() {
    try {
      const rooms = getRooms();
      console.log("API - Salas encontradas:", rooms);
      return new Response(JSON.stringify(rooms), {
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        }
      });
    } catch (error) {
      console.error("API - Erro ao buscar salas:", error);
      return new Response(JSON.stringify([]), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        }
      });
    }
  }
}; 