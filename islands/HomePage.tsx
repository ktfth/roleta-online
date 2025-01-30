import CreateRoom from "./CreateRoom.tsx";
import type { Room } from "../types/room.ts";
import { h } from "preact";
import { useTranslation } from "../hooks/useTranslation.ts";

interface HomePageProps {
  rooms: Room[];
}

export default function HomePage({ rooms }: HomePageProps) {
  const { t } = useTranslation();

  // Função para gerar o link correto baseado no tipo da sala
  const getRoomLink = (room: Room) => {
    if (room.chatOnly) {
      return `/sala/${room.id}?chatOnly=true`;
    }
    // Se é uma transmissão (isStreamOnly) ou está transmitindo (isTransmitting)
    const params = new URLSearchParams({
      streamOnly: room.isStreamOnly ? "true" : "false",
      isSpectator: "true",
      // hideInactive é true quando é uma transmissão (isStreamOnly) ou quando está transmitindo (isTransmitting)
      hideInactive: (room.isStreamOnly).toString()
    });
    return `/sala/${room.id}?${params.toString()}`;
  };

  // Função para obter o texto do botão baseado no tipo da sala
  const getRoomButtonText = (room: Room) => {
    if (room.chatOnly) {
      return t("room.enterChat");
    }
    if (room.isStreamOnly || room.isTransmitting) {
      return t("room.watchStream");
    }
    return t("room.enterRoom");
  };

  // Função para selecionar uma sala aleatória disponível
  const getRandomRoom = () => {
    const availableRooms = rooms.filter(room => !room.isPrivate && room.userCount < 2);
    if (availableRooms.length === 0) {
      return `chat/${Math.random().toString(36).substring(2, 8)}`;
    }
    const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
    return `chat/${randomRoom.id}`;
  };

  return (
    <div class="p-4 mx-auto max-w-screen-lg">
      <h1 class="text-4xl font-bold text-center mb-8">{t("common.title")}</h1>
      
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4">{t("home.startNewChat")}</h2>
          <div class="space-y-4">
            <CreateRoom />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4">{t("home.liveStreams")}</h2>
          <div class="bg-white rounded-lg shadow-sm border p-8 max-h-[80vh] overflow-y-auto">
            {rooms.length > 0 ? (
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
                      <a
                        href={getRoomLink(room)}
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {getRoomButtonText(room)}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div class="flex flex-col items-center justify-center py-8">
                <div class="text-gray-400 mb-2">
                  <svg class="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h3 class="text-xl text-gray-700 font-medium mb-2">{t("room.noActiveRooms")}</h3>
                <p class="text-gray-500 mb-8">{t("room.beFirstToCreate")}</p>
              </div>
            )}
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 class="text-2xl font-semibold mb-4">{t("home.howToUse")}</h2>
          <div class="grid md:grid-cols-2 gap-6 text-gray-600">
            <div>
              <h3 class="font-semibold text-gray-800 mb-2">{t("home.createStream")}</h3>
              <ol class="list-decimal list-inside space-y-2">
                <li>{t("home.howTo.step1")}</li>
                <li>{t("home.howTo.step2")}</li>
                <li>{t("home.howTo.step3")}</li>
                <li>{t("home.howTo.step4")}</li>
                <li>{t("home.howTo.step5")}</li>
                <li>{t("home.howTo.step6")}</li>
              </ol>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 mb-2">{t("home.watchStream")}</h3>
              <ol class="list-decimal list-inside space-y-2">
                <li>{t("home.howTo.watch1")}</li>
                <li>{t("home.howTo.watch2")}</li>
                <li>{t("home.howTo.watch3")}</li>
                <li>{t("home.howTo.watch4")}</li>
                <li>{t("home.howTo.watch5")}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 