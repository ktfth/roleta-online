export interface Room {
  id: string;
  users: Set<WebSocket>;
  hasCamera: boolean;
  createdAt: number;
  isTransmitting: boolean;
  userName: string;
  isPrivate: boolean;
  password?: string;
  isStreamOnly: boolean;
  chatOnly?: boolean;
  creatorSocket?: WebSocket;
}

export const rooms = new Map<string, Room>();

export function createRoom(
  id: string, 
  hasCamera: boolean, 
  userName: string, 
  creatorSocket: WebSocket,
  isPrivate = false, 
  password?: string,
  isStreamOnly = false,
  chatOnly = false
): Room {
  const room = {
    id,
    users: new Set<WebSocket>(),
    hasCamera,
    createdAt: Date.now(),
    isTransmitting: hasCamera && !chatOnly,
    userName,
    isPrivate,
    password,
    isStreamOnly,
    chatOnly,
    creatorSocket,
  };
  rooms.set(id, room);
  return room;
}

export function getOrCreateRoom(
  id: string, 
  hasCamera: boolean, 
  userName: string, 
  socket: WebSocket,
  isPrivate = false, 
  password?: string,
  isStreamOnly = false,
  chatOnly = false
): Room {
  const existingRoom = rooms.get(id);
  if (existingRoom) {
    // Se a sala é privada, verificar a senha
    if (existingRoom.isPrivate && existingRoom.password !== password) {
      throw new Error("Senha incorreta");
    }
    return existingRoom;
  }
  return createRoom(id, hasCamera, userName, socket, isPrivate, password, isStreamOnly, chatOnly);
}

export function getRooms() {
  return Array.from(rooms.values())
    .filter(room => !room.isPrivate)
    .map(room => ({
      id: room.id,
      isPrivate: room.isPrivate,
      chatOnly: room.chatOnly || false,
      isStreamOnly: room.isStreamOnly || false,
      userCount: room.users.size,
      userName: room.userName || "Anônimo",
      hasCamera: room.hasCamera,
      isTransmitting: room.isTransmitting
    }));
}

// Função para remover uma sala
export function removeRoom(id: string) {
  rooms.delete(id);
}

// Função para atualizar o status de transmissão de uma sala
export function updateRoomTransmission(id: string, isTransmitting: boolean) {
  const room = rooms.get(id);
  if (room) {
    room.isTransmitting = isTransmitting;
  }
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