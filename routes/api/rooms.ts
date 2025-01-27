import { Handlers } from "$fresh/server.ts";
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

export const handler: Handlers = {
  GET() {
    try {
      const rooms = getRooms();
      console.log("API - Salas encontradas:", rooms);
      return new Response(JSON.stringify(rooms), {
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    } catch (error) {
      console.error("API - Erro ao buscar salas:", error);
      return new Response(JSON.stringify([]), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
  },

  OPTIONS() {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
}; 