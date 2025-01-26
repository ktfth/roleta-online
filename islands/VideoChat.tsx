import { useEffect, useRef, useState } from "preact/hooks";

import { h } from "preact";

interface VideoChatProps {
  roomId: string;
}

export default function VideoChat({ roomId }: VideoChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [userName, setUserName] = useState("Anônimo");
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState<string | undefined>();
  const [isCheckingRoom, setIsCheckingRoom] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isStreamOnly, setIsStreamOnly] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const webSocket = useRef<WebSocket | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  // Primeiro efeito para verificar se a sala é privada
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkRoom = async () => {
      try {
        // Primeiro, verificar se temos uma senha na URL
        const params = new URLSearchParams(window.location.search);
        const urlPassword = params.get("password");
        const isCreator = params.get("creator") === "true";
        const isPrivateParam = params.get("private") === "true";
        const isStreamOnlyParam = params.get("streamOnly") === "true";

        // Se somos o criador, não precisamos verificar a sala ainda
        if (isCreator) {
          setIsPrivate(isPrivateParam);
          setIsStreamOnly(isStreamOnlyParam);
          if (isPrivateParam && urlPassword) {
            setPassword(urlPassword);
          }
          setIsCheckingRoom(false);
          return;
        }

        // Se não somos o criador, verificar a sala
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Sala não encontrada. Aguarde o criador iniciar a sala.");
          } else {
            throw new Error("Erro ao acessar a sala");
          }
          return;
        }
        
        const room = await response.json();
        setIsPrivate(room.isPrivate);
        setIsStreamOnly(room.isStreamOnly);
        setIsSpectator(true);

        // Se a sala é privada e não somos o criador, precisamos da senha
        if (room.isPrivate) {
          let roomPassword = urlPassword;
          
          // Se não temos senha na URL ou a senha está incorreta, solicitar
          if (!roomPassword || retryCount > 0) {
            roomPassword = prompt(
              retryCount > 0 
                ? "Senha incorreta. Tente novamente:" 
                : "Esta sala é privada. Digite a senha para entrar:"
            );
          }

          if (!roomPassword) {
            window.location.href = "/"; // Redirecionar se cancelar
            return;
          }

          setPassword(roomPassword);

          // Verificar a senha
          const verifyResponse = await fetch(`/api/rooms/${roomId}/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: roomPassword }),
          });

          if (!verifyResponse.ok) {
            setRetryCount(prev => prev + 1);
            throw new Error("Senha incorreta");
          }
        }

        setIsCheckingRoom(false);
      } catch (err) {
        console.error("Erro ao verificar sala:", err);
        if (err.message === "Senha incorreta") {
          // Tentar novamente com nova senha
          checkRoom();
        } else {
          setError(err.message);
          setIsCheckingRoom(false);
        }
      }
    };

    checkRoom();
  }, [roomId, retryCount]);

  // Segundo efeito para inicializar WebRTC após verificação da sala
  useEffect(() => {
    if (typeof window === "undefined" || isCheckingRoom) return;

    // Solicitar nome do usuário
    const name = prompt("Digite seu nome (opcional):", "Anônimo");
    if (name) setUserName(name);

    const initWebRTC = async () => {
      try {
        // Inicializar câmera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setHasCamera(true);
          setIsTransmitting(true);
        }

        // Configurar WebRTC
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // Adicionar tracks
        stream.getTracks().forEach(track => {
          if (peerConnection.current) {
            peerConnection.current.addTrack(track, stream);
          }
        });

        // Configurar canal de dados
        dataChannel.current = peerConnection.current.createDataChannel("chat");
        setupDataChannel();

        // Configurar eventos de conexão
        peerConnection.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate && webSocket.current) {
            webSocket.current.send(JSON.stringify({
              type: "ice-candidate",
              candidate: event.candidate,
            }));
          }
        };

        // Conectar ao WebSocket
        const wsUrl = new URL(`ws://${window.location.host}/api/ws`);
        wsUrl.searchParams.set("roomId", roomId);
        wsUrl.searchParams.set("hasCamera", "true");
        wsUrl.searchParams.set("userName", userName);
        wsUrl.searchParams.set("isPrivate", String(isPrivate));
        if (password) {
          wsUrl.searchParams.set("password", password);
        }

        webSocket.current = new WebSocket(wsUrl.toString());

        webSocket.current.onopen = () => {
          webSocket.current?.send(JSON.stringify({
            type: "start-transmitting",
            userName,
          }));
        };

        webSocket.current.onmessage = async (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "error") {
            setError(data.message);
            stopTransmission();
            webSocket.current?.close();
            return;
          }

          if (data.type === "user-joined") {
            setMessages(prev => [...prev, `${data.userName} entrou na sala`]);
            // Criar e enviar oferta quando um novo usuário entrar
            if (peerConnection.current) {
              const offer = await peerConnection.current.createOffer();
              await peerConnection.current.setLocalDescription(offer);
              webSocket.current?.send(JSON.stringify({
                type: "offer",
                offer,
              }));
            }
          } else if (data.type === "user-left") {
            setMessages(prev => [...prev, `${data.userName} saiu da sala`]);
          } else if (data.type === "offer") {
            // Responder à oferta
            if (peerConnection.current) {
              await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await peerConnection.current.createAnswer();
              await peerConnection.current.setLocalDescription(answer);
              webSocket.current?.send(JSON.stringify({
                type: "answer",
                answer,
              }));
            }
          } else if (data.type === "answer") {
            // Processar resposta
            if (peerConnection.current) {
              await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(data.answer)
              );
            }
          } else if (data.type === "ice-candidate") {
            // Adicionar candidato ICE
            if (peerConnection.current) {
              await peerConnection.current.addIceCandidate(
                new RTCIceCandidate(data.candidate)
              );
            }
          } else if (data.type === "chat") {
            // Adicionar mensagem ao chat
            setMessages(prev => [...prev, `${data.userName || "Outro"}: ${data.message}`]);
          }
        };

        setIsConnected(true);
      } catch (err) {
        console.error("Erro ao inicializar:", err);
        setError("Erro ao acessar câmera e microfone. Por favor, permita o acesso.");
      }
    };

    initWebRTC();

    return () => {
      stopTransmission();
      webSocket.current?.close();
      peerConnection.current?.close();
    };
  }, [roomId, isPrivate, password, isCheckingRoom]);

  const setupDataChannel = () => {
    if (!dataChannel.current) return;

    dataChannel.current.onmessage = (event) => {
      setMessages(prev => [...prev, `Outro: ${event.data}`]);
    };
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Enviar via WebSocket para garantir que a mensagem chegue
      webSocket.current?.send(JSON.stringify({
        type: "chat",
        message: message.trim(),
        userName,
      }));

      // Enviar via DataChannel se disponível
      if (dataChannel.current?.readyState === "open") {
        dataChannel.current.send(message);
      }

      setMessages(prev => [...prev, `Você: ${message}`]);
      setMessage("");
    }
  };

  const stopTransmission = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        track.stop();
      });
      localStream.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleTransmission = async () => {
    if (isTransmitting) {
      // Parar transmissão
      stopTransmission();
      webSocket.current?.send(JSON.stringify({
        type: "stop-transmitting",
        userName,
      }));
      setIsTransmitting(false);
    } else {
      // Reiniciar transmissão
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        webSocket.current?.send(JSON.stringify({
          type: "start-transmitting",
          userName,
        }));
        setIsTransmitting(true);
      } catch (err) {
        console.error("Erro ao reiniciar câmera:", err);
        setError("Erro ao acessar câmera e microfone. Por favor, permita o acesso.");
      }
    }
  };

  if (error) {
    return (
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600">{error}</p>
        <a href="/" class="mt-4 inline-block text-blue-500 hover:underline">
          Voltar para a página inicial
        </a>
      </div>
    );
  }

  return (
    <div class={`p-4 ${isStreamOnly ? "flex gap-4" : ""}`}>
      <div class={isStreamOnly ? "flex-1" : ""}>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Conectado como: {userName}</h2>
          {!isSpectator && (
            <button
              onClick={toggleTransmission}
              class={`px-4 py-2 rounded ${
                isTransmitting
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {isTransmitting ? "Parar Transmissão" : "Iniciar Transmissão"}
            </button>
          )}
        </div>

        <div class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-white mb-2">
            {isSpectator ? "Transmissão" : "Seu vídeo"}
            {!isConnected && <span class="text-gray-400 text-sm ml-2">(Aguardando conexão...)</span>}
          </h3>
          <video
            ref={isSpectator ? remoteVideoRef : localVideoRef}
            autoPlay
            playsInline
            muted={!isSpectator}
            class="w-full aspect-video bg-black rounded"
          />
        </div>
      </div>

      <div class={`${isStreamOnly ? "w-80" : "mt-4"} bg-white rounded-lg shadow p-4`}>
        <h3 class="text-lg font-semibold mb-4">Chat</h3>
        <div class={`${isStreamOnly ? "h-[calc(100vh-12rem)]" : "h-48"} bg-gray-50 rounded mb-4 p-2 overflow-y-auto`}>
          {messages.map((msg, index) => (
            <div key={index} class="mb-2">
              {msg}
            </div>
          ))}
        </div>
        <div class="flex gap-2">
          <input
            type="text"
            value={message}
            onInput={(e) => setMessage((e.target as HTMLInputElement).value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            class="flex-1 px-3 py-2 border rounded"
            placeholder="Digite sua mensagem..."
          />
          <button
            onClick={sendMessage}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
} 
