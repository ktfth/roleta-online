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
  const chatOnly = url.searchParams.get("chatOnly") === "true";
  const isStreamOnly = url.searchParams.get("streamOnly") === "true";
  
  let currentRoom: Room | null = null;

  socket.onopen = () => {
    try {
      currentRoom = getOrCreateRoom(roomId, hasCamera, userName, socket, isPrivate, password, isStreamOnly, chatOnly);
      currentRoom.users.add(socket);
      
      // Notificar outros usuários na sala
      broadcastToRoom(
        currentRoom,
        JSON.stringify({ 
          type: "user-joined",
          userName,
          hasCamera,
          chatOnly,
        }),
        socket
      );
    } catch (err: unknown) {
      socket.send(JSON.stringify({
        type: "error",
        message: err instanceof Error ? err.message : "Erro desconhecido",
      }));
      socket.close();
    }
  };

  socket.onmessage = (e) => {
    if (!currentRoom) return;

    try {
      const data = JSON.parse(e.data);
      
      if (data.type === "start-transmitting" && !currentRoom.chatOnly) {
        currentRoom.isTransmitting = true;
      } else if (data.type === "stop-transmitting" && !currentRoom.chatOnly) {
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
      
      // Se o criador saiu, notificar todos e remover a sala
      if (socket === currentRoom.creatorSocket) {
        broadcastToRoom(
          currentRoom,
          JSON.stringify({ 
            type: "creator-left",
            message: "O criador da sala saiu. A sala será encerrada.",
          })
        );
        rooms.delete(currentRoom.id);
      } else if (currentRoom.users.size === 0) {
        // Se não há mais usuários, remover a sala
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