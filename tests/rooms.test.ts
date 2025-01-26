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

  const room = createRoom(
    "test-123",
    true,
    "Teste",
    false,
    undefined,
    false,
    false
  );

  assertEquals(room.id, "test-123");
  assertEquals(room.userName, "Teste");
  assertEquals(room.hasCamera, true);
  assertEquals(room.isPrivate, false);
  assertEquals(room.isStreamOnly, false);
  assertEquals(room.chatOnly, false);
  assertEquals(room.isTransmitting, true);
});

Deno.test("Criação de sala apenas chat", () => {
  rooms.clear();

  const room = createRoom(
    "chat-123",
    false,
    "Chat Teste",
    false,
    undefined,
    false,
    true
  );

  assertEquals(room.id, "chat-123");
  assertEquals(room.userName, "Chat Teste");
  assertEquals(room.hasCamera, false);
  assertEquals(room.isPrivate, false);
  assertEquals(room.isStreamOnly, false);
  assertEquals(room.chatOnly, true);
  assertEquals(room.isTransmitting, false);
});

Deno.test("Obter ou criar sala existente", () => {
  rooms.clear();

  // Criar sala primeiro
  const room1 = createRoom(
    "test-456",
    true,
    "Teste",
    false,
    undefined,
    false,
    false
  );

  // Tentar obter a mesma sala
  const room2 = getOrCreateRoom(
    "test-456",
    true,
    "Outro Nome",
    false,
    undefined,
    false,
    false
  );

  assertEquals(room1, room2);
  assertEquals(room2.userName, "Teste"); // Deve manter o nome original
});

Deno.test("Sala privada com senha", () => {
  rooms.clear();

  const room = createRoom(
    "private-123",
    true,
    "Sala Privada",
    true,
    "senha123",
    false,
    false
  );

  assertEquals(room.isPrivate, true);
  assertEquals(room.password, "senha123");

  // Tentar acessar com senha correta
  const roomWithCorrectPass = getOrCreateRoom(
    "private-123",
    true,
    "Teste",
    true,
    "senha123",
    false,
    false
  );

  assertEquals(room, roomWithCorrectPass);

  // Tentar acessar com senha incorreta
  try {
    getOrCreateRoom(
      "private-123",
      true,
      "Teste",
      true,
      "senha-errada",
      false,
      false
    );
    throw new Error("Deveria ter lançado erro de senha incorreta");
  } catch (err: unknown) {
    if (err instanceof Error) {
      assertEquals(err.message, "Senha incorreta");
    }
  }
});

Deno.test("Listagem de salas", () => {
  rooms.clear();

  // Criar várias salas com diferentes configurações
  createRoom("room1", true, "Sala 1", false, undefined, false, false);
  createRoom("room2", true, "Sala 2", false, undefined, false, false);
  createRoom("chat1", false, "Chat 1", false, undefined, false, true);
  createRoom("chat2", false, "Chat 2", false, undefined, false, true);

  const listedRooms = getRooms();

  // Deve listar todas as salas (2 normais + 2 chat)
  assertEquals(listedRooms.length, 4);

  // Verificar se as salas de chat estão sendo listadas
  const chatRooms = listedRooms.filter(room => room.chatOnly);
  assertEquals(chatRooms.length, 2);
});

Deno.test("Remoção de sala", () => {
  rooms.clear();

  createRoom("to-remove", true, "Sala para Remover", false);
  assertEquals(rooms.has("to-remove"), true);

  removeRoom("to-remove");
  assertEquals(rooms.has("to-remove"), false);
});

Deno.test("Atualização de status de transmissão", () => {
  rooms.clear();

  createRoom("stream-test", true, "Sala de Teste", false);
  
  // Parar transmissão
  updateRoomTransmission("stream-test", false);
  assertEquals(rooms.get("stream-test")?.isTransmitting, false);

  // Reiniciar transmissão
  updateRoomTransmission("stream-test", true);
  assertEquals(rooms.get("stream-test")?.isTransmitting, true);
});

Deno.test("Contagem de usuários", () => {
  rooms.clear();

  const room = createRoom("users-test", true, "Sala de Teste", false);
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
