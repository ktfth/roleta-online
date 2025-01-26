import { Room, getOrCreateRoom, rooms } from "../../utils/rooms.ts";

import { HandlerContext } from "$fresh/server.ts";

function broadcastToRoom(room: Room, message: string, exclude?: WebSocket) {
  room.users.forEach((user) => {
    if (user !== exclude && user.readyState === WebSocket.OPEN) {
      user.send(message);
    }
  });
}

// Limpar salas inativas periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms.entries()) {
    if (now - room.createdAt > 3600000 || room.users.size === 0) { // 1 hora
      rooms.delete(id);
    }
  }
}, 300000); // 5 minutos

export const handler = (req: Request, _ctx: HandlerContext): Response => {
  const { socket, response } = Deno.upgradeWebSocket(req);
  const url = new URL(req.url);
  const roomId = url.searchParams.get("roomId") || "";
  const hasCamera = url.searchParams.get("hasCamera") === "true";
  const userName = url.searchParams.get("userName") || "Anônimo";
  const isPrivate = url.searchParams.get("isPrivate") === "true";
  const password = url.searchParams.get("password") || undefined;
  
  let currentRoom: Room | null = null;

  socket.onopen = () => {
    try {
      currentRoom = getOrCreateRoom(roomId, hasCamera, userName, isPrivate, password);
      currentRoom.users.add(socket);
      
      // Notificar outros usuários na sala
      broadcastToRoom(
        currentRoom,
        JSON.stringify({ 
          type: "user-joined",
          userName,
          hasCamera,
        }),
        socket
      );
    } catch (err) {
      socket.send(JSON.stringify({
        type: "error",
        message: err.message,
      }));
      socket.close();
    }
  };

  socket.onmessage = (e) => {
    if (!currentRoom) return;

    try {
      const data = JSON.parse(e.data);
      
      if (data.type === "start-transmitting") {
        currentRoom.isTransmitting = true;
      } else if (data.type === "stop-transmitting") {
        currentRoom.isTransmitting = false;
      }
      
      // Repassar mensagens de sinalização para outros usuários na sala
      broadcastToRoom(currentRoom, e.data, socket);
    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  };

  socket.onclose = () => {
    if (currentRoom) {
      currentRoom.users.delete(socket);
      if (currentRoom.users.size === 0) {
        currentRoom.isTransmitting = false;
        rooms.delete(currentRoom.id);
      } else {
        // Notificar outros usuários que alguém saiu
        broadcastToRoom(
          currentRoom,
          JSON.stringify({ 
            type: "user-left",
            userName,
          }),
          socket
        );
      }
    }
  };

  return response;
}; 