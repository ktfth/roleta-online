import { assertEquals, assertNotEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { createRoom, getOrCreateRoom, getRooms, removeRoom, rooms, updateRoomTransmission } from "../utils/rooms.ts";

// Mock do WebSocket para testes
class MockWebSocket {
  readyState = WebSocket.OPEN;
  send(data: string) {}
  close() {}
}

Deno.test("Criação de sala", () => {
  // Limpar salas antes do teste
  rooms.clear();
  const mockSocket = new MockWebSocket() as unknown as WebSocket;

  const room = createRoom(
    "test-123",
    true,
    "Teste",
    mockSocket,
    false,
    false
  );

  assertEquals(room.id, "test-123");
  assertEquals(room.userName, "Teste");
  assertEquals(room.hasCamera, true);
  assertEquals(room.isStreamOnly, false);
  assertEquals(room.chatOnly, false);
  assertEquals(room.isTransmitting, true);
  assertEquals(room.creatorSocket, mockSocket);
});

Deno.test("Criação de sala apenas chat", () => {
  rooms.clear();
  const mockSocket = new MockWebSocket() as unknown as WebSocket;

  const room = createRoom(
    "chat-123",
    false,
    "Chat Teste",
    mockSocket,
    false,
    true
  );

  assertEquals(room.id, "chat-123");
  assertEquals(room.userName, "Chat Teste");
  assertEquals(room.hasCamera, false);
  assertEquals(room.isStreamOnly, false);
  assertEquals(room.chatOnly, true);
  assertEquals(room.isTransmitting, false);
  assertEquals(room.creatorSocket, mockSocket);
});

Deno.test("Obter ou criar sala existente", () => {
  rooms.clear();
  const mockSocket = new MockWebSocket() as unknown as WebSocket;
  const mockSocket2 = new MockWebSocket() as unknown as WebSocket;

  // Criar sala primeiro
  const room1 = createRoom(
    "test-456",
    true,
    "Teste",
    mockSocket,
    false,
    false
  );

  // Tentar obter a mesma sala
  const room2 = getOrCreateRoom(
    "test-456",
    true,
    "Outro Nome",
    mockSocket2,
    false,
    false
  );

  assertEquals(room1, room2);
  assertEquals(room2.userName, "Teste"); // Deve manter o nome original
  assertEquals(room2.creatorSocket, mockSocket); // Deve manter o criador original
});

Deno.test("Listagem de salas", () => {
  rooms.clear();
  const mockSocket = new MockWebSocket() as unknown as WebSocket;

  // Criar várias salas com diferentes configurações
  createRoom("room1", true, "Sala 1", mockSocket);
  createRoom("room2", true, "Sala 2", mockSocket);
  createRoom("chat1", false, "Chat 1", mockSocket, false, true);
  createRoom("chat2", false, "Chat 2", mockSocket, false, true);

  const listedRooms = getRooms();

  // Deve listar todas as salas (2 normais + 2 chat)
  assertEquals(listedRooms.length, 4);

  // Verificar se as salas de chat estão sendo listadas
  const chatRooms = listedRooms.filter(room => room.chatOnly);
  assertEquals(chatRooms.length, 2);
});

Deno.test("Remoção de sala", () => {
  rooms.clear();
  const mockSocket = new MockWebSocket() as unknown as WebSocket;

  createRoom("to-remove", true, "Sala para Remover", mockSocket);
  assertEquals(rooms.has("to-remove"), true);

  removeRoom("to-remove");
  assertEquals(rooms.has("to-remove"), false);
});

Deno.test("Atualização de status de transmissão", () => {
  rooms.clear();
  const mockSocket = new MockWebSocket() as unknown as WebSocket;

  createRoom("stream-test", true, "Sala de Teste", mockSocket);
  
  // Parar transmissão
  updateRoomTransmission("stream-test", false);
  assertEquals(rooms.get("stream-test")?.isTransmitting, false);

  // Reiniciar transmissão
  updateRoomTransmission("stream-test", true);
  assertEquals(rooms.get("stream-test")?.isTransmitting, true);
});

Deno.test("Contagem de usuários", () => {
  rooms.clear();
  const mockSocket = new MockWebSocket() as unknown as WebSocket;

  const room = createRoom("users-test", true, "Sala de Teste", mockSocket);
  assertEquals(room.users.size, 0);

  // Adicionar usuários
  const user1 = new MockWebSocket() as unknown as WebSocket;
  const user2 = new MockWebSocket() as unknown as WebSocket;

  room.users.add(user1);
  assertEquals(room.users.size, 1);

  room.users.add(user2);
  assertEquals(room.users.size, 2);

  // Remover usuários
  room.users.delete(user1);
  assertEquals(room.users.size, 1);
}); 
