import { useEffect, useRef, useState } from "preact/hooks";

import { h } from "preact";

interface VideoChatProps {
  roomId: string;
  chatOnly?: boolean;
  userName?: string;
  isPrivate: boolean;
  password?: string;
}

export default function VideoChat({ roomId, chatOnly = false, userName = "Anônimo", isPrivate, password }: VideoChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [localUserName, setUserName] = useState(userName);
  const [error, setError] = useState<string | null>(null);
  const [localIsPrivate, setIsPrivate] = useState(isPrivate);
  const [localPassword, setPassword] = useState<string | undefined>(password);
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
      } catch (err: unknown) {
        console.error("Erro ao verificar sala:", err);
        if (err instanceof Error && err.message === "Senha incorreta") {
          // Tentar novamente com nova senha
          checkRoom();
        } else if (err instanceof Error) {
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
        // Configurar WebRTC com STUN servers
        peerConnection.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" }
          ],
        });

        // Se não for modo somente chat, inicializar câmera
        if (!chatOnly) {
          try {
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

            // Adicionar tracks para WebRTC
            stream.getTracks().forEach((track: MediaStreamTrack) => {
              if (peerConnection.current && localStream.current) {
                peerConnection.current.addTrack(track, localStream.current);
              }
            });
          } catch (mediaErr) {
            console.error("Erro ao acessar mídia:", mediaErr);
            setError("Erro ao acessar câmera e microfone. Por favor, permita o acesso.");
            return;
          }
        }

        // Configurar canal de dados para chat
        dataChannel.current = peerConnection.current.createDataChannel("chat");
        setupDataChannel();

        // Configurar eventos de conexão
        peerConnection.current.ontrack = (event) => {
          console.log("Recebendo track remoto:", event.streams[0]);
          if (remoteVideoRef.current && !chatOnly) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current.play().catch(e => console.error("Erro ao reproduzir vídeo:", e));
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

        peerConnection.current.oniceconnectionstatechange = () => {
          console.log("ICE Connection State:", peerConnection.current?.iceConnectionState);
        };

        // Conectar ao WebSocket
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = new URL(`${wsProtocol}//${window.location.host}/api/ws`);
        wsUrl.searchParams.set("roomId", roomId);
        wsUrl.searchParams.set("hasCamera", String(!chatOnly));
        wsUrl.searchParams.set("userName", userName);
        wsUrl.searchParams.set("isPrivate", String(isPrivate));
        if (password) {
          wsUrl.searchParams.set("password", password);
        }
        if (chatOnly) {
          wsUrl.searchParams.set("chatOnly", "true");
        }

        webSocket.current = new WebSocket(wsUrl.toString());

        webSocket.current.onopen = () => {
          webSocket.current?.send(JSON.stringify({
            type: "start-transmitting",
            userName,
            chatOnly,
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
            // Criar e enviar oferta quando um novo usuário entrar e não for modo somente chat
            if (peerConnection.current && !chatOnly && !isStreamOnly) {
              try {
                const offer = await peerConnection.current.createOffer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: true
                });
                await peerConnection.current.setLocalDescription(offer);
                webSocket.current?.send(JSON.stringify({
                  type: "offer",
                  offer,
                }));
              } catch (err) {
                console.error("Erro ao criar oferta:", err);
              }
            }
          } else if (data.type === "user-left") {
            setMessages(prev => [...prev, `${data.userName} saiu da sala`]);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
          } else if (data.type === "offer" && !chatOnly) {
            // Responder à oferta apenas se não for modo somente chat
            if (peerConnection.current) {
              try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                webSocket.current?.send(JSON.stringify({
                  type: "answer",
                  answer,
                }));
              } catch (err) {
                console.error("Erro ao processar oferta:", err);
              }
            }
          } else if (data.type === "answer" && !chatOnly) {
            // Processar resposta apenas se não for modo somente chat
            if (peerConnection.current) {
              try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
              } catch (err) {
                console.error("Erro ao processar resposta:", err);
              }
            }
          } else if (data.type === "ice-candidate" && !chatOnly) {
            // Adicionar candidato ICE apenas se não for modo somente chat
            if (peerConnection.current) {
              try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
              } catch (err) {
                console.error("Erro ao adicionar ICE candidate:", err);
              }
            }
          } else if (data.type === "chat") {
            // Adicionar mensagem ao chat
            setMessages(prev => [...prev, `${data.userName || "Outro"}: ${data.message}`]);
          }
        };

        setIsConnected(true);
      } catch (err: unknown) {
        console.error("Erro ao inicializar:", err);
        if (err instanceof Error) {
          setError("Erro ao acessar câmera e microfone. Por favor, permita o acesso.");
        }
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
    if (!chatOnly && localStream.current) {
      localStream.current.getTracks().forEach(track => {
        track.stop();
      });
      localStream.current = null;
    }
    if (!chatOnly && localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleTransmission = async () => {
    if (chatOnly) return; // Não permitir toggle se for modo somente chat
    
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
    <div class="flex flex-col h-screen">
      <div class={`flex-1 ${(!chatOnly && !isStreamOnly) ? 'flex flex-col' : 'flex flex-row'} p-4 gap-4`}>
        {/* Container principal dos vídeos */}
        <div class={`
          ${!chatOnly ? 'flex' : 'hidden'}
          ${(!chatOnly && !isStreamOnly) ? 'flex-1 flex-row' : 'flex-1'}
          gap-4 h-full
        `}>
          {/* Vídeo local */}
          <div class={`
            relative flex-1
            ${(!chatOnly && !isStreamOnly) ? 'w-1/2' : 'w-full'}
            bg-gray-900 rounded-lg overflow-hidden
          `}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              class={`w-full h-full object-cover ${!isTransmitting && "hidden"}`}
            />
            {isTransmitting && (
              <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                Você
              </div>
            )}
          </div>

          {/* Vídeo remoto */}
          {!chatOnly && !isStreamOnly && (
            <div class="relative flex-1 w-1/2 bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                class="w-full h-full object-cover"
              />
              <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                Outro participante
              </div>
            </div>
          )}
        </div>

        {/* Chat container */}
        <div class={`
          flex flex-col bg-white rounded-lg shadow-lg
          ${chatOnly ? 'flex-1' : ''}
          ${(!chatOnly && !isStreamOnly) ? 'h-64' : 'w-80'}
        `}>
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold">Chat</h2>
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
                value={message}
                onChange={(e) => setMessage(e.currentTarget.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Digite sua mensagem..."
                class="flex-1 px-3 py-2 border rounded"
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
      </div>

      {/* Controles */}
      <div class="p-4 bg-gray-100 border-t">
        <div class="flex justify-center gap-4">
          {!chatOnly && (
            <button
              onClick={toggleTransmission}
              class={`px-6 py-2 rounded-lg font-medium ${
                isTransmitting
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white transition-colors`}
            >
              {isTransmitting ? "Parar Transmissão" : "Iniciar Transmissão"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
