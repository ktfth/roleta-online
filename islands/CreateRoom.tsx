import { h } from "preact";
import { useState } from "preact/hooks";
import { useTranslation } from "../hooks/useTranslation.ts";

export default function CreateRoom() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [isStreamOnly, setIsStreamOnly] = useState(false);
  const [isChatOnly, setIsChatOnly] = useState(false);
  const { t } = useTranslation();

  const createRoom = () => {
    const roomId = crypto.randomUUID().substring(0, 8);
    const url = new URL(`/sala/${roomId}`, window.location.href);
    
    url.searchParams.set("creator", "true");
    
    if (isPrivate && password) {
      url.searchParams.set("private", "true");
      url.searchParams.set("password", password);
    }

    url.searchParams.set("streamOnly", String(isStreamOnly));

    if (isChatOnly) {
      url.searchParams.set("chatOnly", "true");
    }

    window.location.href = url.toString();
  };

  return (
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="isChatOnly"
            checked={isChatOnly}
            onChange={(e) => {
              setIsChatOnly(e.currentTarget.checked);
              setIsStreamOnly(false);
            }}
            class="rounded border-gray-300"
          />
          <label htmlFor="isChatOnly" class="text-sm text-gray-700">
            {t("room.chatOnly")}
          </label>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="isStreamOnly"
            checked={isStreamOnly}
            disabled={isChatOnly}
            onChange={(e) => setIsStreamOnly(e.currentTarget.checked)}
            class="rounded border-gray-300"
          />
          <label htmlFor="isStreamOnly" class={`text-sm ${isChatOnly ? "text-gray-400" : "text-gray-700"}`}>
            {t("room.streamOnly")}
          </label>
        </div>
      </div>

      <button
        onClick={createRoom}
        disabled={isPrivate && password.length < 4}
        class="block w-full text-center py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("common.createRoom")} 
        {isPrivate && t("common.createRoomButton.private")} 
        {isStreamOnly && t("common.createRoomButton.stream")} 
        {isChatOnly && t("common.createRoomButton.chatOnly")}
      </button>
    </div>
  );
} 