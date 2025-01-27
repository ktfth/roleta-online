import { useEffect, useState } from "preact/hooks";

import { h } from "preact";

interface Room {
  id: string;
  userCount: number;
  hasCamera: boolean;
  isTransmitting: boolean;
  userName: string;
  isPrivate: boolean;
  chatOnly?: boolean;
  isStreamOnly: boolean;
}

export default function RoomList() {
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms");
        if (!response.ok) {
          throw new Error("Erro ao buscar salas");
        }
        const rooms = await response.json();
        const updatedRooms = rooms.map((room: Room) => ({
          ...room,
          isStreamOnly: room.isTransmitting || new URLSearchParams(window.location.search).get("streamOnly") === "true"
        }));
        setActiveRooms(updatedRooms);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar salas:", err);
        setError("Não foi possível carregar as salas");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div class="text-center py-8">
        <p class="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          class="text-blue-500 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {loading ? (
        <div class="animate-pulse space-y-4">
          <div class="h-24 bg-gray-200 rounded-lg"></div>
          <div class="h-24 bg-gray-200 rounded-lg"></div>
          <div class="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      ) : activeRooms.length > 0 ? (
        activeRooms.map((room) => (
          <div 
            key={room.id} 
            class="border rounded-lg p-4 hover:border-blue-500 transition-colors bg-white hover:shadow-md"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-semibold text-lg">{room.userName}</h3>
                  {(room.isStreamOnly || room.isTransmitting) && (
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full animate-pulse">
                      AO VIVO
                    </span>
                  )}
                  {room.chatOnly && (
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      APENAS CHAT
                    </span>
                  )}
                  {room.isPrivate && (
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      PRIVADA
                    </span>
                  )}
                </div>
                <div class="flex items-center gap-4">
                  <p class="text-sm text-gray-500">
                    {room.userCount} {room.chatOnly ? "usuário" : "espectador"}{room.userCount !== 1 && "s"}
                  </p>
                  <p class="text-sm text-gray-500">
                    Sala #{room.id.substring(0, 6)}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a 
                  href={`/sala/${room.id}${
                    room.chatOnly 
                      ? "?chatOnly=true" 
                      : (room.isStreamOnly || room.isTransmitting)
                        ? "?streamOnly=true&hideInactive=true&isSpectator=true" 
                        : ""
                  }`}
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <span>
                    {room.chatOnly ? "Entrar no Chat" : (room.isStreamOnly || room.isTransmitting) ? "Assistir Transmissão" : "Entrar na Sala"}
                  </span>
                </a>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 mb-2 font-medium">Nenhuma sala ativa</p>
          <p class="text-sm text-gray-400 mb-4">
            Seja o primeiro a criar uma sala!
          </p>
          <div class="space-y-2">
            <a
              href={`/chat/${crypto.randomUUID().substring(0, 8)}?creator=true`}
              class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Criar Nova Sala
            </a>
            <br />
            <a
              href={`/chat/${crypto.randomUUID().substring(0, 8)}?chatOnly=true&creator=true`}
              class="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Criar Sala de Chat
            </a>
            <br />
            <a
              href={`/chat/${crypto.randomUUID().substring(0, 8)}?streamOnly=true&creator=true`}
              class="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Criar Transmissão
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 