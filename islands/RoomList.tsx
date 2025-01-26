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
        setActiveRooms(rooms);
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
                  {!room.chatOnly && (
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full animate-pulse">
                      AO VIVO
                    </span>
                  )}
                  {room.chatOnly && (
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                      </svg>
                      APENAS CHAT
                    </span>
                  )}
                  {room.isPrivate && (
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                      </svg>
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
                  href={`/chat/${room.id}${room.chatOnly ? "?chatOnly=true" : ""}`}
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <span>{room.isPrivate ? "Entrar com Senha" : room.chatOnly ? "Entrar no Chat" : "Assistir"}</span>
                  {!room.chatOnly && (
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                    </svg>
                  )}
                  {room.chatOnly && (
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                    </svg>
                  )}
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
              href={`/chat/${crypto.randomUUID().substring(0, 8)}`}
              class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Criar Nova Sala
            </a>
            <br />
            <a
              href={`/chat/${crypto.randomUUID().substring(0, 8)}?chatOnly=true`}
              class="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Criar Sala de Chat
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 