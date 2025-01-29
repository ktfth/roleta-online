import { useEffect, useState } from "preact/hooks";

import { h } from "preact";
import { useTranslation } from "../utils/i18n.ts";

interface Room {
  id: string;
  isPrivate: boolean;
  chatOnly: boolean;
  isStreamOnly: boolean;
  isTransmitting: boolean;
  userCount: number;
  userName?: string;
  hasCamera: boolean;
}

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (!response.ok) throw new Error(t("common.error"));
      const data = await response.json();
      setRooms(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p class="mt-2 text-gray-600">{t("common.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div class="text-center py-8">
        <div class="text-red-500 mb-2">
          <svg class="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-600">{t("common.error")}: {error}</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-500 mb-2 font-medium">{t("room.noActiveRooms")}</p>
        <p class="text-sm text-gray-400 mb-4">
          {t("room.beFirstToCreate")}
        </p>
        <div class="space-y-2">
          <a
            href={`/chat/${crypto.randomUUID().substring(0, 8)}?creator=true&streamOnly=false`}
            class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {t("common.createRoom")}
          </a>
          <br />
          <a
            href={`/chat/${crypto.randomUUID().substring(0, 8)}?chatOnly=true&creator=true&streamOnly=false`}
            class="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            {t("room.chatMode")}
          </a>
          <br />
          <a
            href={`/chat/${crypto.randomUUID().substring(0, 8)}?streamOnly=true&creator=true`}
            class="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            {t("room.streamMode")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {rooms.map(room => (
        <div key={room.id} class="p-4 border rounded-lg hover:bg-gray-50">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-medium">{room.userName || t("common.anonymous")}</h3>
              <p class="text-sm text-gray-500">
                {room.chatOnly 
                  ? t("room.textChat") 
                  : room.isStreamOnly 
                    ? t("room.liveStream") 
                    : t("room.videoChat")}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <a 
                href={`/sala/${room.id}${
                  room.chatOnly 
                    ? "?chatOnly=true&streamOnly=false" 
                    : room.isStreamOnly
                      ? "?streamOnly=true&isSpectator=true" 
                      : "?streamOnly=false"
                }`}
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-2"
              >
                <span>
                  {room.chatOnly 
                    ? t("room.enterChat") 
                    : room.isStreamOnly 
                      ? t("room.watchStream") 
                      : t("room.enterRoom")}
                </span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 