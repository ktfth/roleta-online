import { IS_BROWSER } from "$fresh/runtime.ts";
import LanguageDetector from "npm:i18next-browser-languagedetector";
import i18next from "npm:i18next";

const resources = {
  "pt-BR": {
    translation: {
      common: {
        createRoom: "Criar Sala",
        joinRoom: "Entrar na Sala",
        back: "Voltar para a página inicial",
        loading: "Carregando...",
        error: "Erro",
        title: "Roleta Online - Chat com Vídeo",
        or: "ou",
        anonymous: "Anônimo",
        forkOnGithub: "Faça um fork no GitHub",
        enterName: "Digite seu nome (opcional):",
        camera: {
          error: "Erro ao acessar câmera e microfone. Por favor, permita o acesso.",
          accessError: "Erro ao acessar mídia:"
        },
        you: "Você",
        streamer: "Transmissor",
        errors: {
          initError: "Erro ao inicializar:",
          createOfferError: "Erro ao criar oferta:",
          processOfferError: "Erro ao processar oferta:",
          processAnswerError: "Erro ao processar resposta:",
          iceCandidateError: "Erro ao adicionar ICE candidate:",
          playVideoError: "Erro ao reproduzir vídeo:",
          checkRoomError: "Erro ao verificar sala:",
          restartCameraError: "Erro ao reiniciar câmera:"
        },
        debug: {
          receivingTrack: "Recebendo track remoto:",
          iceState: "ICE Connection State:"
        },
        createRoomButton: {
          private: "Privada",
          stream: "(Transmissão)",
          chatOnly: "(Apenas Chat)"
        }
      },
      room: {
        title: "Sala",
        waiting: "Aguardando outros jogadores...",
        players: "Jogadores",
        start: "Iniciar Jogo",
        yourTurn: "Sua vez",
        waitingTurn: "Aguardando sua vez...",
        chatOnly: "Apenas chat (sem vídeo)",
        streamOnly: "Modo transmissão (apenas espectadores)",
        passwordPlaceholder: "Digite a senha da sala",
        passwordHint: "A senha deve ter pelo menos 4 caracteres",
        private: "Privada",
        streamMode: "Transmissão",
        chatMode: "Apenas Chat",
        enterChat: "Entrar no Chat",
        watchStream: "Assistir Transmissão",
        enterRoom: "Entrar na Sala",
        textChat: "Chat de texto",
        liveStream: "Transmissão ao vivo",
        videoChat: "Chat com vídeo",
        noActiveRooms: "Nenhuma sala ativa",
        beFirstToCreate: "Seja o primeiro a criar uma sala!",
        startTransmission: "Iniciar Transmissão",
        stopTransmission: "Parar Transmissão"
      },
      chat: {
        sendMessage: "Enviar mensagem",
        placeholder: "Digite sua mensagem...",
        title: "Chat",
        otherUser: "Outro",
        typeMessage: "Digite sua mensagem..."
      },
      home: {
        startNewChat: "Iniciar Novo Chat",
        textOnlyChat: "Chat Apenas Texto",
        liveStreams: "Transmissões Ao Vivo",
        howToUse: "Como Usar",
        createStream: "Criar uma Transmissão",
        watchStream: "Assistir uma Transmissão",
        howTo: {
          step1: "Clique em \"Criar Sala\"",
          step2: "Escolha entre sala pública ou privada",
          step3: "Se privada, defina uma senha",
          step4: "Digite seu nome (opcional)",
          step5: "Permita o acesso à câmera e microfone",
          step6: "Compartilhe o link da sua transmissão",
          watch1: "Escolha uma transmissão ao vivo da lista",
          watch2: "Digite a senha se for uma sala privada",
          watch3: "Ou clique em \"Chat Aleatório\" para uma conversa surpresa",
          watch4: "Interaja através do chat em tempo real",
          watch5: "Inicie sua própria transmissão quando quiser"
        }
      }
    }
  },
  "en-US": {
    translation: {
      common: {
        createRoom: "Create Room",
        joinRoom: "Join Room",
        back: "Back to home page",
        loading: "Loading...",
        error: "Error",
        title: "Online Roulette - Video Chat",
        or: "or",
        anonymous: "Anonymous",
        forkOnGithub: "Fork me on GitHub",
        enterName: "Enter your name (optional):",
        camera: {
          error: "Error accessing camera and microphone. Please allow access.",
          accessError: "Error accessing media:"
        },
        you: "You",
        streamer: "Streamer",
        errors: {
          initError: "Error initializing:",
          createOfferError: "Error creating offer:",
          processOfferError: "Error processing offer:",
          processAnswerError: "Error processing answer:",
          iceCandidateError: "Error adding ICE candidate:",
          playVideoError: "Error playing video:",
          checkRoomError: "Error checking room:",
          restartCameraError: "Error restarting camera:"
        },
        debug: {
          receivingTrack: "Receiving remote track:",
          iceState: "ICE Connection State:"
        },
        createRoomButton: {
          private: "Private",
          stream: "(Stream)",
          chatOnly: "(Chat Only)"
        }
      },
      room: {
        title: "Room",
        waiting: "Waiting for other players...",
        players: "Players",
        start: "Start Game",
        yourTurn: "Your turn",
        waitingTurn: "Waiting for your turn...",
        chatOnly: "Chat only (no video)",
        streamOnly: "Stream mode (spectators only)",
        passwordPlaceholder: "Enter room password",
        passwordHint: "Password must be at least 4 characters",
        private: "Private",
        streamMode: "Stream",
        chatMode: "Chat Only",
        enterChat: "Enter Chat",
        watchStream: "Watch Stream",
        enterRoom: "Enter Room",
        textChat: "Text chat",
        liveStream: "Live stream",
        videoChat: "Video chat",
        noActiveRooms: "No active rooms",
        beFirstToCreate: "Be the first to create a room!",
        startTransmission: "Start Transmission",
        stopTransmission: "Stop Transmission"
      },
      chat: {
        sendMessage: "Send message",
        placeholder: "Type your message...",
        title: "Chat",
        otherUser: "Other",
        typeMessage: "Type your message..."
      },
      home: {
        startNewChat: "Start New Chat",
        textOnlyChat: "Text Only Chat",
        liveStreams: "Live Streams",
        howToUse: "How to Use",
        createStream: "Create a Stream",
        watchStream: "Watch a Stream",
        howTo: {
          step1: "Click on \"Create Room\"",
          step2: "Choose between public or private room",
          step3: "If private, set a password",
          step4: "Enter your name (optional)",
          step5: "Allow camera and microphone access",
          step6: "Share your stream link",
          watch1: "Choose a live stream from the list",
          watch2: "Enter password if it's a private room",
          watch3: "Or click on \"Random Chat\" for a surprise conversation",
          watch4: "Interact through real-time chat",
          watch5: "Start your own stream whenever you want"
        }
      }
    }
  }
};

if (IS_BROWSER) {
  await i18next
    .use(LanguageDetector)
    .init({
      resources,
      fallbackLng: "pt-BR",
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ["cookie", "localStorage", "navigator"],
        lookupCookie: "language",
        caches: ["cookie", "localStorage"]
      }
    });
}

export default i18next; 