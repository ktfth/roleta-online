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
}

export const rooms = new Map<string, Room>();

export function createRoom(
  id: string, 
  hasCamera: boolean, 
  userName: string, 
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
  };
  rooms.set(id, room);
  return room;
}

export function getOrCreateRoom(
  id: string, 
  hasCamera: boolean, 
  userName: string, 
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
  return createRoom(id, hasCamera, userName, isPrivate, password, isStreamOnly, chatOnly);
}

export function getRooms() {
  return Array.from(rooms.values())
    .filter(room => (room.hasCamera && room.isTransmitting) || room.chatOnly)
    .map(room => ({
      id: room.id,
      userCount: room.users.size,
      hasCamera: room.hasCamera,
      isTransmitting: room.isTransmitting,
      userName: room.userName,
      isPrivate: room.isPrivate,
      isStreamOnly: room.isStreamOnly,
      chatOnly: room.chatOnly,
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