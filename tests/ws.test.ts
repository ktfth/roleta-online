import { assertEquals, assertExists } from "https://deno.land/std@0.210.0/assert/mod.ts";

import { handler } from "../routes/api/ws.ts";
import { rooms } from "../utils/rooms.ts";

// Mock do WebSocket para testes
class MockWebSocket {
  readyState = WebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  sentMessages: string[] = [];

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    if (this.onclose) this.onclose();
  }

  simulateMessage(data: string) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
}

// Mock do Deno.upgradeWebSocket
const originalUpgradeWebSocket = Deno.upgradeWebSocket;
function mockUpgradeWebSocket(socket: MockWebSocket) {
  (Deno as any).upgradeWebSocket = () => ({
    socket,
    response: new Response(),
  });
}

// Restaurar o upgradeWebSocket original após os testes
function restoreUpgradeWebSocket() {
  (Deno as any).upgradeWebSocket = originalUpgradeWebSocket;
}

Deno.test("Conexão WebSocket - Sala Normal", async () => {
  rooms.clear();
  const socket = new MockWebSocket();
  mockUpgradeWebSocket(socket);

  try {
    const url = new URL("ws://localhost/api/ws");
    url.searchParams.set("roomId", "test-ws-1");
    url.searchParams.set("hasCamera", "true");
    url.searchParams.set("userName", "Teste WS");

    const req = new Request(url);
    handler(req, {} as any);

    // Simular conexão aberta
    if (socket.onopen) socket.onopen();

    // Verificar se a sala foi criada
    const room = rooms.get("test-ws-1");
    assertExists(room);
    assertEquals(room.userName, "Teste WS");
    assertEquals(room.hasCamera, true);
    assertEquals(room.chatOnly, false);

    // Verificar se a mensagem de entrada foi enviada
    assertEquals(socket.sentMessages.length, 0); // Não deve enviar mensagem para si mesmo

    // Simular início de transmissão
    socket.simulateMessage(JSON.stringify({
      type: "start-transmitting",
    }));

    assertEquals(room.isTransmitting, true);

    // Simular mensagem de chat
    socket.simulateMessage(JSON.stringify({
      type: "chat",
      message: "Olá!",
      userName: "Teste WS",
    }));

    // Simular fechamento
    socket.close();

    // Verificar se a sala foi removida (já que era o único usuário)
    assertEquals(rooms.has("test-ws-1"), false);
  } finally {
    restoreUpgradeWebSocket();
  }
});

Deno.test("Conexão WebSocket - Sala Apenas Chat", async () => {
  rooms.clear();
  const socket = new MockWebSocket();
  mockUpgradeWebSocket(socket);

  try {
    const url = new URL("ws://localhost/api/ws");
    url.searchParams.set("roomId", "test-ws-2");
    url.searchParams.set("hasCamera", "false");
    url.searchParams.set("userName", "Chat WS");
    url.searchParams.set("chatOnly", "true");

    const req = new Request(url);
    handler(req, {} as any);

    // Simular conexão aberta
    if (socket.onopen) socket.onopen();

    // Verificar se a sala foi criada
    const room = rooms.get("test-ws-2");
    assertExists(room);
    assertEquals(room.userName, "Chat WS");
    assertEquals(room.hasCamera, false);
    assertEquals(room.chatOnly, true);
    assertEquals(room.isTransmitting, false);

    // Tentar iniciar transmissão (não deve funcionar em sala de chat)
    socket.simulateMessage(JSON.stringify({
      type: "start-transmitting",
    }));

    assertEquals(room.isTransmitting, false);

    // Simular mensagem de chat
    socket.simulateMessage(JSON.stringify({
      type: "chat",
      message: "Olá do chat!",
      userName: "Chat WS",
    }));

    // Simular fechamento
    socket.close();

    // Verificar se a sala foi removida
    assertEquals(rooms.has("test-ws-2"), false);
  } finally {
    restoreUpgradeWebSocket();
  }
}); 