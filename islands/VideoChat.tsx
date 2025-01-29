import { useEffect, useRef, useState } from "preact/hooks";

import { h } from "preact";
import { t } from "../utils/i18n.ts";

interface VideoChatProps {
  roomId: string;
  chatOnly?: boolean;
  userName?: string;
  isPrivate?: boolean;
  password?: string;
  streamOnly?: boolean;
}

export default function VideoChat({ roomId, chatOnly = false, userName = t("common.anonymous"), isPrivate, password, streamOnly = false }: VideoChatProps) {
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCheckingRoom, setIsCheckingRoom] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const checkRoom = async () => {
    if (typeof window === "undefined") return;

    try {
      // Verificar parâmetros da URL
      const params = new URLSearchParams(window.location.search);
      const urlPassword = params.get("password");
      const isCreator = params.get("creator") === "true";
      const isPrivateParam = params.get("private") === "true";
      const streamOnlyParam = params.get("streamOnly") === "true";

      // Se for o criador, não precisa verificar a sala
      if (isCreator) {
        setIsCheckingRoom(false);
        return;
      }

      // Verificar se a sala existe
      const response = await fetch(`/api/rooms/${roomId}`);
      if (!response.ok) {
        setError(t("room.notFound"));
        throw new Error(t("room.accessError"));
      }

      const room = await response.json();

      // Se a sala for privada, verificar a senha
      if (room.isPrivate) {
        let inputPassword = urlPassword;
        while (!inputPassword) {
          inputPassword = prompt(
            t(urlPassword ? "room.wrongPassword" : "room.enterPassword")
          );
          if (!inputPassword) return;
        }

        // Verificar a senha
        const verifyResponse = await fetch(`/api/rooms/${roomId}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: inputPassword,
          }),
        });

        if (!verifyResponse.ok) {
          throw new Error(t("room.wrongPassword"));
        }
      }

      setIsCheckingRoom(false);
    } catch (err) {
      console.error("Erro ao verificar sala:", err);
      if (err instanceof Error && err.message === t("room.wrongPassword")) {
        window.location.reload();
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const initializeWebRTC = async () => {
    if (typeof window === "undefined" || isCheckingRoom) return;

    try {
      // Solicitar nome do usuário se não fornecido
      if (!userName || userName === t("common.anonymous")) {
        const name = prompt(t("common.enterName"), t("common.anonymous"));
        if (name) userName = name;
      }

      // Configurar conexão WebRTC
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" }
        ]
      });

      // Se não for apenas chat, configurar vídeo
      if (!chatOnly) {
        try {
          localStream.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });

          // Adicionar tracks à conexão peer
          localStream.current.getTracks().forEach(track => {
            if (localStream.current) {
              peerConnection.current?.addTrack(track, localStream.current);
            }
          });

          // Mostrar vídeo local
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream.current;
            await localVideoRef.current.play();
          }
        } catch (mediaErr) {
          console.error(t("common.camera.accessError"), mediaErr);
          localStream.current = null;
          setError(t("common.camera.error"));
        }
      }

      // Configurar canal de dados para chat
      if (peerConnection.current) {
        dataChannel.current = peerConnection.current.createDataChannel("chat");
      }

      // Configurar handlers de eventos WebRTC
      if (peerConnection.current) {
        peerConnection.current.ontrack = (event) => {
          console.log(t("common.debug.receivingTrack"), event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current.play().catch(e => console.error(t("common.errors.playVideoError"), e));
          }
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
              type: "ice-candidate",
              candidate: event.candidate
            }));
          }
        };

        peerConnection.current.oniceconnectionstatechange = () => {
          console.log(t("common.debug.iceState"), peerConnection.current?.iceConnectionState);
        };
      }

      // Conectar ao WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = new URL(`${protocol}//${window.location.host}/api/ws`);
      wsUrl.searchParams.set("roomId", roomId);
      wsUrl.searchParams.set("hasCamera", String(!chatOnly));
      wsUrl.searchParams.set("userName", userName);
      wsUrl.searchParams.set("isPrivate", String(isPrivate));
      wsUrl.searchParams.set("streamOnly", String(streamOnly));

      if (password) {
        wsUrl.searchParams.set("password", password);
      }

      if (chatOnly) {
        wsUrl.searchParams.set("chatOnly", "true");
      }

      ws.current = new WebSocket(wsUrl.toString());

      // Se for modo transmissão, iniciar transmissão
      if (streamOnly && !chatOnly) {
        setIsTransmitting(true);
        ws.current.addEventListener("open", () => {
          ws.current?.send(JSON.stringify({
            type: "start-transmitting"
          }));
        });
      }

      // Configurar handlers de eventos WebSocket
      ws.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "error") {
          setError(data.message);
          if (ws.current) {
            ws.current.close();
          }
        }

        if (data.type === "creator-left") {
          setError(t("room.creatorLeft"));
          if (ws.current) {
            ws.current.close();
          }
        }

        if (data.type === "user-joined" && !chatOnly) {
          try {
            const offer = await peerConnection.current?.createOffer();
            await peerConnection.current?.setLocalDescription(offer);

            if (ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send(JSON.stringify({
                type: "offer",
                offer
              }));
            }
          } catch (err) {
            console.error(t("common.errors.createOfferError"), err);
          }
        } else if (data.type === "user-left") {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        } else if (data.type === "offer" && !chatOnly) {
          try {
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.current?.createAnswer();
            await peerConnection.current?.setLocalDescription(answer);

            if (ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send(JSON.stringify({
                type: "answer",
                answer
              }));
            }
          } catch (err) {
            console.error(t("common.errors.processOfferError"), err);
          }
        } else if (data.type === "answer" && !chatOnly) {
          try {
            const remoteDesc = new RTCSessionDescription(data.answer);
            await peerConnection.current?.setRemoteDescription(remoteDesc);
          } catch (err) {
            console.error(t("common.errors.processAnswerError"), err);
          }
        } else if (data.type === "ice-candidate" && !chatOnly) {
          try {
            await peerConnection.current?.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          } catch (err) {
            console.error(t("common.errors.iceCandidateError"), err);
          }
        } else if (data.type === "chat") {
          setMessages(prev => [...prev, `${data.userName || t("chat.otherUser")}: ${data.message}`]);
        }
      };
    } catch (err) {
      console.error(t("common.errors.initError"), err);
      localStream.current = null;
      setError(t("common.camera.error"));
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    // Enviar mensagem via WebSocket
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "chat",
        message: newMessage
      }));

      // Adicionar mensagem localmente
      setMessages(prev => [...prev, `${userName}: ${newMessage}`]);
    }

    // Enviar mensagem via canal de dados WebRTC
    if (dataChannel.current?.readyState === "open") {
      dataChannel.current.send(JSON.stringify({
        userName,
        message: newMessage
      }));
    }

    setNewMessage("");
  };

  const toggleTransmission = async () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    if (isTransmitting) {
      // Parar transmissão
      ws.current.send(JSON.stringify({
        type: "stop-transmitting"
      }));

      // Parar todas as tracks
      localStream.current?.getTracks().forEach(track => track.stop());
      localStream.current = null;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      setIsTransmitting(false);
    } else {
      try {
        // Reiniciar câmera
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
          await localVideoRef.current.play();
        }

        // Iniciar transmissão
        ws.current.send(JSON.stringify({
          type: "start-transmitting"
        }));

        setIsTransmitting(true);
      } catch (err) {
        console.error("Erro ao reiniciar câmera:", err);
        setError(t("common.camera.error"));
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    checkRoom().then(() => {
      if (!error) {
        initializeWebRTC();
      }
    });

    const handleBeforeUnload = () => {
      localStream.current?.getTracks().forEach(track => track.stop());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      localStream.current?.getTracks().forEach(track => track.stop());
      ws.current?.close();
    };
  }, []);

  if (error) {
    return (
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600">{error}</p>
        <a href="/" class="mt-4 inline-block text-blue-500 hover:underline">
          {t("common.back")}
        </a>
      </div>
    );
  }

  if (isCheckingRoom) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div class="flex flex-col h-screen">
      {!chatOnly && (
        <div class="flex-1 grid grid-cols-2 gap-4 p-4 bg-gray-100">
          {/* Vídeo Local */}
          <div class="relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              class={`w-full h-full object-cover ${!isTransmitting && "hidden"}`}
            />
            {isTransmitting && (
              <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {userName} ({t("common.you")})
              </div>
            )}
          </div>

          {/* Vídeo Remoto */}
          <div class="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              class="w-full h-full object-cover"
            />
            <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              {t("common.anonymous")}
            </div>
          </div>
        </div>
      )}

      {/* Chat */}
      <div class="h-1/2 flex flex-col bg-white">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold">{t("chat.title")}</h2>
        </div>
        <div class="flex-1 p-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={index} class="mb-2 p-2 rounded bg-gray-50">
              {message}
            </div>
          ))}
        </div>
        <div class="p-4 border-t">
          <div class="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.currentTarget.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder={t("chat.typeMessage")}
              class="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={sendMessage}
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t("chat.sendMessage")}
            </button>
          </div>
        </div>

        {/* Controles de Transmissão */}
        {!chatOnly && streamOnly && (
          <div class="p-4 bg-gray-100 border-t">
            <div class="flex justify-center gap-4">
              <button
                onClick={toggleTransmission}
                class={`px-4 py-2 text-white rounded transition ${
                  isTransmitting
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isTransmitting ? t("room.stopTransmission") : t("room.startTransmission")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
