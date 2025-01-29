import { Signal, useSignal } from "@preact/signals";

import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect } from "preact/hooks";

export type Language = "pt-BR" | "en-US";

// Carrega os arquivos JSON no lado do servidor
const translations = {
  "pt-BR": {
    "common": {
      "createRoom": "Criar Sala",
      "joinRoom": "Entrar na Sala",
      "back": "Voltar",
      "loading": "Carregando...",
      "error": "Erro",
      "title": "Roleta Online - Chat com Vídeo",
      "or": "ou",
      "anonymous": "Anônimo",
      "forkOnGithub": "Faça um fork no GitHub",
      "enterName": "Digite seu nome (opcional):",
      "camera": {
        "error": "Erro ao acessar câmera e microfone. Por favor, permita o acesso.",
        "accessError": "Erro ao acessar mídia:"
      },
      "you": "Você",
      "errors": {
        "initError": "Erro ao inicializar:",
        "createOfferError": "Erro ao criar oferta:",
        "processOfferError": "Erro ao processar oferta:",
        "processAnswerError": "Erro ao processar resposta:",
        "iceCandidateError": "Erro ao adicionar ICE candidate:",
        "playVideoError": "Erro ao reproduzir vídeo:",
        "checkRoomError": "Erro ao verificar sala:",
        "restartCameraError": "Erro ao reiniciar câmera:"
      },
      "debug": {
        "receivingTrack": "Recebendo track remoto:",
        "iceState": "ICE Connection State:"
      },
      "createRoomButton": {
        "private": "Privada",
        "stream": "(Transmissão)",
        "chatOnly": "(Apenas Chat)"
      }
    },
    "room": {
      "title": "Sala",
      "waiting": "Aguardando outros jogadores...",
      "players": "Jogadores",
      "start": "Iniciar Jogo",
      "yourTurn": "Sua vez",
      "waitingTurn": "Aguardando sua vez...",
      "chatOnly": "Apenas chat (sem vídeo)",
      "streamOnly": "Modo transmissão (apenas espectadores)",
      "passwordPlaceholder": "Digite a senha da sala",
      "passwordHint": "A senha deve ter pelo menos 4 caracteres",
      "private": "Privada",
      "streamMode": "Transmissão",
      "chatMode": "Apenas Chat",
      "enterChat": "Entrar no Chat",
      "watchStream": "Assistir Transmissão",
      "enterRoom": "Entrar na Sala",
      "textChat": "Chat de texto",
      "liveStream": "Transmissão ao vivo",
      "videoChat": "Chat com vídeo",
      "noActiveRooms": "Nenhuma sala ativa",
      "beFirstToCreate": "Seja o primeiro a criar uma sala!",
      "notFound": "Sala não encontrada. Aguarde o criador iniciar a sala.",
      "accessError": "Erro ao acessar a sala",
      "wrongPassword": "Senha incorreta. Tente novamente:",
      "enterPassword": "Esta sala é privada. Digite a senha para entrar:",
      "creatorLeft": "O criador da sala saiu",
      "startTransmission": "Iniciar Transmissão",
      "stopTransmission": "Parar Transmissão",
      "randomChat": "Chat Aleatório",
      "availableRooms": "salas disponíveis",
      "createNewRoom": "Criar Nova Sala",
      "createChatRoom": "Criar Sala de Chat",
      "createStream": "Criar Transmissão",
      "createPrivate": "Criar sala privada"
    },
    "chat": {
      "sendMessage": "Enviar mensagem",
      "placeholder": "Digite sua mensagem...",
      "title": "Chat",
      "otherUser": "Outro",
      "typeMessage": "Digite sua mensagem..."
    },
    "home": {
      "startNewChat": "Iniciar Novo Chat",
      "textOnlyChat": "Chat Apenas Texto",
      "liveStreams": "Transmissões Ao Vivo",
      "howToUse": "Como Usar",
      "createStream": "Criar uma Transmissão",
      "watchStream": "Assistir uma Transmissão",
      "howTo": {
        "step1": "Clique em \"Criar Sala\"",
        "step2": "Escolha entre sala pública ou privada",
        "step3": "Se privada, defina uma senha",
        "step4": "Digite seu nome (opcional)",
        "step5": "Permita o acesso à câmera e microfone",
        "step6": "Compartilhe o link da sua transmissão",
        "watch1": "Escolha uma transmissão ao vivo da lista",
        "watch2": "Digite a senha se for uma sala privada",
        "watch3": "Ou clique em \"Chat Aleatório\" para uma conversa surpresa",
        "watch4": "Interaja através do chat em tempo real",
        "watch5": "Inicie sua própria transmissão quando quiser"
      }
    }
  },
  "en-US": {
    "common": {
      "createRoom": "Create Room",
      "joinRoom": "Join Room",
      "back": "Back",
      "loading": "Loading...",
      "error": "Error",
      "title": "Online Roulette - Video Chat",
      "or": "or",
      "anonymous": "Anonymous",
      "forkOnGithub": "Fork me on GitHub",
      "enterName": "Enter your name (optional):",
      "camera": {
        "error": "Error accessing camera and microphone. Please allow access.",
        "accessError": "Error accessing media:"
      },
      "you": "You",
      "errors": {
        "initError": "Error initializing:",
        "createOfferError": "Error creating offer:",
        "processOfferError": "Error processing offer:",
        "processAnswerError": "Error processing answer:",
        "iceCandidateError": "Error adding ICE candidate:",
        "playVideoError": "Error playing video:",
        "checkRoomError": "Error checking room:",
        "restartCameraError": "Error restarting camera:"
      },
      "debug": {
        "receivingTrack": "Receiving remote track:",
        "iceState": "ICE Connection State:"
      },
      "createRoomButton": {
        "private": "Private",
        "stream": "(Stream)",
        "chatOnly": "(Chat Only)"
      }
    },
    "room": {
      "title": "Room",
      "waiting": "Waiting for other players...",
      "players": "Players",
      "start": "Start Game",
      "yourTurn": "Your turn",
      "waitingTurn": "Waiting for your turn...",
      "chatOnly": "Chat only (no video)",
      "streamOnly": "Stream mode (spectators only)",
      "passwordPlaceholder": "Enter room password",
      "passwordHint": "Password must be at least 4 characters",
      "private": "Private",
      "streamMode": "Stream",
      "chatMode": "Chat Only",
      "enterChat": "Enter Chat",
      "watchStream": "Watch Stream",
      "enterRoom": "Enter Room",
      "textChat": "Text chat",
      "liveStream": "Live stream",
      "videoChat": "Video chat",
      "noActiveRooms": "No active rooms",
      "beFirstToCreate": "Be the first to create a room!",
      "notFound": "Room not found. Please wait for the creator to start the room.",
      "accessError": "Error accessing room",
      "wrongPassword": "Wrong password. Try again:",
      "enterPassword": "This room is private. Enter the password to join:",
      "creatorLeft": "The room creator has left",
      "startTransmission": "Start Transmission",
      "stopTransmission": "Stop Transmission",
      "randomChat": "Random Chat",
      "availableRooms": "available rooms",
      "createNewRoom": "Create New Room",
      "createChatRoom": "Create Chat Room",
      "createStream": "Create Stream",
      "createPrivate": "Create private room"
    },
    "chat": {
      "sendMessage": "Send message",
      "placeholder": "Type your message...",
      "title": "Chat",
      "otherUser": "Other",
      "typeMessage": "Type your message..."
    },
    "home": {
      "startNewChat": "Start New Chat",
      "textOnlyChat": "Text Only Chat",
      "liveStreams": "Live Streams",
      "howToUse": "How to Use",
      "createStream": "Create a Stream",
      "watchStream": "Watch a Stream",
      "howTo": {
        "step1": "Click on \"Create Room\"",
        "step2": "Choose between public or private room",
        "step3": "If private, set a password",
        "step4": "Enter your name (optional)",
        "step5": "Allow camera and microphone access",
        "step6": "Share your stream link",
        "watch1": "Choose a live stream from the list",
        "watch2": "Enter password if it's a private room",
        "watch3": "Or click on \"Random Chat\" for a surprise conversation",
        "watch4": "Interact through real-time chat",
        "watch5": "Start your own stream whenever you want"
      }
    }
  }
};

function getCookie(name: string): string | undefined {
  if (!IS_BROWSER) return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

function setCookie(name: string, value: string, days = 365) {
  if (!IS_BROWSER) return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}${expires}; path=/`;
}

export function getLanguage(): Language {
  if (!IS_BROWSER) return "pt-BR";
  
  const savedLang = getCookie("language") as Language;
  if (savedLang && translations[savedLang]) {
    return savedLang;
  }
  
  const browserLang = navigator.language;
  const defaultLang = browserLang.startsWith("pt") ? "pt-BR" : "en-US";
  setCookie("language", defaultLang);
  return defaultLang;
}

export function setLanguage(lang: Language) {
  if (IS_BROWSER) {
    setCookie("language", lang);
  }
}

export function t(key: string): string {
  const lang = getLanguage();
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value === undefined) break;
    value = value[k];
  }
  
  return value || key;
}

export function useTranslation() {
  const language = useSignal<Language>(getLanguage());

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;
      language.value = customEvent.detail;
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const translate = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language.value];
    
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    
    return value || key;
  };

  return {
    language: language.value,
    t: translate
  };
}

// Função para obter traduções estáticas
export function getStaticTranslations(lang: Language) {
  return {
    common: {
      createRoom: translations[lang].common.createRoom,
      joinRoom: translations[lang].common.joinRoom,
      back: translations[lang].common.back,
      loading: translations[lang].common.loading,
      error: translations[lang].common.error,
      title: translations[lang].common.title,
      or: translations[lang].common.or,
      anonymous: translations[lang].common.anonymous,
      forkOnGithub: translations[lang].common.forkOnGithub,
      enterName: translations[lang].common.enterName,
      you: translations[lang].common.you,
      camera: translations[lang].common.camera,
      errors: translations[lang].common.errors,
      debug: translations[lang].common.debug,
      createRoomButton: translations[lang].common.createRoomButton
    },
    room: {
      title: translations[lang].room.title,
      waiting: translations[lang].room.waiting,
      players: translations[lang].room.players,
      start: translations[lang].room.start,
      yourTurn: translations[lang].room.yourTurn,
      waitingTurn: translations[lang].room.waitingTurn,
      chatOnly: translations[lang].room.chatOnly,
      streamOnly: translations[lang].room.streamOnly,
      passwordPlaceholder: translations[lang].room.passwordPlaceholder,
      passwordHint: translations[lang].room.passwordHint,
      private: translations[lang].room.private,
      streamMode: translations[lang].room.streamMode,
      chatMode: translations[lang].room.chatMode,
      enterChat: translations[lang].room.enterChat,
      watchStream: translations[lang].room.watchStream,
      enterRoom: translations[lang].room.enterRoom,
      textChat: translations[lang].room.textChat,
      liveStream: translations[lang].room.liveStream,
      videoChat: translations[lang].room.videoChat,
      noActiveRooms: translations[lang].room.noActiveRooms,
      beFirstToCreate: translations[lang].room.beFirstToCreate
    },
    chat: {
      sendMessage: translations[lang].chat.sendMessage,
      placeholder: translations[lang].chat.placeholder,
      title: translations[lang].chat.title,
      otherUser: translations[lang].chat.otherUser,
      typeMessage: translations[lang].chat.typeMessage
    },
    home: {
      startNewChat: translations[lang].home.startNewChat,
      textOnlyChat: translations[lang].home.textOnlyChat,
      liveStreams: translations[lang].home.liveStreams,
      howToUse: translations[lang].home.howToUse,
      createStream: translations[lang].home.createStream,
      watchStream: translations[lang].home.watchStream,
      howTo: translations[lang].home.howTo
    }
  };
}

// Hook para valores traduzidos que precisam ser reativos
export function useTranslatedValue(key: string): Signal<string> {
  const value = useSignal("");
  const { t } = useTranslation();

  useEffect(() => {
    value.value = t(key);
    
    const handleLanguageChange = () => {
      value.value = t(key);
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [key]);

  return value;
} 