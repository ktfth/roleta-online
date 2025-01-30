import { useEffect, useRef, useState } from "preact/hooks";

import { h } from "preact";
import { useTranslation } from "../hooks/useTranslation.ts";

interface VideoChatProps {
  roomId: string;
  chatOnly?: boolean;
  userName?: string;
  isPrivate?: boolean;
  password?: string;
  streamOnly?: boolean;
}

export default function VideoChat({ roomId, chatOnly = false, userName, isPrivate, password, streamOnly = false }: VideoChatProps) {
  const { t, language } = useTranslation();
  const defaultUserName = t("common.anonymous");
  const [currentUserName, setCurrentUserName] = useState(userName || defaultUserName);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCheckingRoom, setIsCheckingRoom] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!userName && defaultUserName !== currentUserName) {
      setCurrentUserName(defaultUserName);
    }
  }, [language, defaultUserName, userName]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsCreator(params.get("creator") === "true");
    }
    checkRoom();
  }, []);

  useEffect(() => {
    if (!isCheckingRoom) {
      initializeWebRTC();
    }
    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isCheckingRoom]);

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
    try {
      if (!chatOnly) {
        const configuration = {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
          ]
        };
        peerConnection.current = new RTCPeerConnection(configuration);

        try {
          localStream.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream.current;
          }

          localStream.current.getTracks().forEach(track => {
            if (peerConnection.current && localStream.current) {
              peerConnection.current.addTrack(track, localStream.current);
            }
          });
        } catch (err) {
          console.error(t("common.errors.mediaDevicesError"), err);
          setError(t("common.errors.cameraAccessDenied"));
          return;
        }
      }

      if (peerConnection.current) {
        peerConnection.current.ontrack = (event) => {
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

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = new URL(`${protocol}//${window.location.host}/api/ws`);
      wsUrl.searchParams.set("roomId", roomId);
      wsUrl.searchParams.set("hasCamera", String(!chatOnly));
      wsUrl.searchParams.set("userName", currentUserName);
      wsUrl.searchParams.set("isPrivate", String(isPrivate));
      wsUrl.searchParams.set("streamOnly", String(streamOnly));
      wsUrl.searchParams.set("creator", String(isCreator));
      
      if (streamOnly) {
        wsUrl.searchParams.set("hide", isCreator ? "remote" : "local");
      }

      if (password) {
        wsUrl.searchParams.set("password", password);
      }

      if (chatOnly) {
        wsUrl.searchParams.set("chatOnly", "true");
      }

      ws.current = new WebSocket(wsUrl.toString());

      if (streamOnly && isCreator) {
        setIsTransmitting(true);
        ws.current.addEventListener("open", () => {
          ws.current?.send(JSON.stringify({
            type: "start-transmitting"
          }));
        });
      }

      ws.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "error") {
          setError(data.message);
          if (ws.current) {
            ws.current.close();
          }
        } else if (data.type === "creator-left") {
          setError(t("room.creatorLeft"));
          if (ws.current) {
            ws.current.close();
          }
        } else if (data.type === "user-joined" && !chatOnly) {
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
            await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error(t("common.errors.iceCandidateError"), err);
          }
        } else if (data.type === "chat") {
          const messageText = `${data.userName}: ${data.message}`;
          setMessages(prev => [...prev, messageText]);
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
    } catch (err) {
      console.error(t("common.errors.initError"), err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleBeforeUnload = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && ws.current?.readyState === WebSocket.OPEN) {
      const messageData = {
        type: "chat",
        userName: currentUserName,
        message: newMessage.trim()
      };

      ws.current.send(JSON.stringify(messageData));
      setMessages(prev => [...prev, `${currentUserName}: ${newMessage.trim()}`]);
      setNewMessage("");
    }
  };

  const toggleTransmission = async () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    if (isTransmitting) {
      ws.current.send(JSON.stringify({
        type: "stop-transmitting"
      }));
      setIsTransmitting(false);
    } else {
      ws.current.send(JSON.stringify({
        type: "start-transmitting"
      }));
      setIsTransmitting(true);
    }
  };

  if (error) {
    return (
      <div class="p-4 bg-red-100 text-red-700 rounded">
        <p>{error}</p>
        <div class="mt-4">
          <a href="/" class="inline-block text-blue-500 hover:underline">
            {t("common.back")}
          </a>
        </div>
      </div>
    );
  }

  if (isCheckingRoom) {
    return (
      <div class="p-4">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div class={`${chatOnly ? 'h-[calc(100vh-4rem)] flex flex-col' : 'container mx-auto p-4'}`}>
      <div class={`flex flex-col ${chatOnly ? 'flex-1' : 'gap-4'}`}>
        {!chatOnly && (
          <div class="w-full">
            <div class="flex flex-col md:flex-row gap-4 max-w-[1920px] mx-auto">
              {(!streamOnly || (streamOnly && isCreator)) && (
                <div class="relative w-full">
                  <div class="aspect-w-16 aspect-h-9">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      class="w-full h-full rounded-lg bg-black object-cover"
                    />
                  </div>
                  <div class="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                    {t("common.you")}
                  </div>
                </div>
              )}
              {(!streamOnly || (streamOnly && !isCreator)) && (
                <div class="relative w-full">
                  <div class="aspect-w-16 aspect-h-9">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      class="w-full h-full rounded-lg bg-black object-cover"
                    />
                  </div>
                  {streamOnly && (
                    <div class="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                      {t("common.streamer")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <div class={`flex flex-col ${chatOnly ? 'flex-1' : 'space-y-4'}`}>
          <div class={`${chatOnly ? 'flex-1 overflow-y-auto px-4' : 'h-96 overflow-y-auto p-4'} bg-gray-100 rounded-lg`}>
            {messages.map((message, index) => (
              <div key={index} class="mb-2">
                <p>{message}</p>
              </div>
            ))}
          </div>
          <div class={`flex gap-2 ${chatOnly ? 'p-4 bg-white border-t' : ''}`}>
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
      </div>
    </div>
  );
} 
