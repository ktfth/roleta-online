import { h } from "preact";
import { useState } from "preact/hooks";

export default function CreateRoom() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [isStreamOnly, setIsStreamOnly] = useState(false);
  const [isChatOnly, setIsChatOnly] = useState(false);

  const createRoom = () => {
    const roomId = crypto.randomUUID().substring(0, 8);
    const url = new URL(`/chat/${roomId}`, window.location.href);
    
    // Adicionar parâmetros para identificar que somos o criador
    url.searchParams.set("creator", "true");
    
    if (isPrivate && password) {
      url.searchParams.set("private", "true");
      url.searchParams.set("password", password);
    }

    if (isStreamOnly) {
      url.searchParams.set("streamOnly", "true");
    }

    if (isChatOnly) {
      url.searchParams.set("chatOnly", "true");
    }

    window.location.href = url.toString();
  };

  return (
    <div class="space-y-4">
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="isChatOnly"
            checked={isChatOnly}
            onChange={(e) => {
              setIsChatOnly(e.currentTarget.checked);
              if (e.currentTarget.checked) {
                setIsStreamOnly(false);
              }
            }}
            class="rounded border-gray-300"
          />
          <label htmlFor="isChatOnly" class="text-sm text-gray-700">
            Apenas chat (sem vídeo)
          </label>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.currentTarget.checked)}
            class="rounded border-gray-300"
          />
          <label htmlFor="isPrivate" class="text-sm text-gray-700">
            Criar sala privada
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
            Modo transmissão (apenas espectadores)
          </label>
        </div>
      </div>

      {isPrivate && (
        <div class="space-y-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Digite a senha da sala"
            class="w-full px-3 py-2 border rounded"
            required
            minLength={4}
          />
          <p class="text-xs text-gray-500">
            A senha deve ter pelo menos 4 caracteres
          </p>
        </div>
      )}

      <button
        onClick={createRoom}
        disabled={isPrivate && password.length < 4}
        class="block w-full text-center py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Criar Sala {isPrivate && "Privada"} {isStreamOnly && "(Transmissão)"} {isChatOnly && "(Apenas Chat)"}
      </button>
    </div>
  );
} 