import CreateRoom from "../islands/CreateRoom.tsx";
import { Head } from "$fresh/runtime.ts";
import RoomList from "../islands/RoomList.tsx";
import { h } from "preact";

export default function Home() {
  return (
    <>
      <Head>
        <title>Roleta Online - Chat com Vídeo</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg">
        <h1 class="text-4xl font-bold text-center mb-8">Roleta Online</h1>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-semibold mb-4">Iniciar Novo Chat</h2>
            <div class="space-y-4">
              <CreateRoom />
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>
              <a
                href={`/chat/${Math.random().toString(36).substring(2, 8)}`}
                class="block w-full text-center py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition mb-2"
              >
                Chat Aleatório
              </a>
              <a
                href={`/chat/${Math.random().toString(36).substring(2, 8)}?chatOnly=true`}
                class="block w-full text-center py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Chat Apenas Texto
              </a>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-semibold mb-4">Transmissões Ao Vivo</h2>
            <div class="bg-white rounded-lg shadow-sm border p-8 max-h-[80vh] overflow-y-auto">
              <div class="flex flex-col items-center justify-center py-8">
                <div class="text-gray-400 mb-2">
                  <svg class="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h3 class="text-xl text-gray-700 font-medium mb-2">Nenhuma sala ativa</h3>
                <p class="text-gray-500 mb-8">Seja o primeiro a criar uma sala!</p>
                
                <div class="flex flex-col w-full max-w-xs gap-4">
                  <a
                    href="/sala/nova"
                    class="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-center transition-colors"
                  >
                    Criar Nova Sala
                  </a>
                  <a
                    href="/sala/nova?chat=true"
                    class="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg text-center transition-colors"
                  >
                    Criar Sala de Chat
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 class="text-2xl font-semibold mb-4">Como Usar</h2>
            <div class="grid md:grid-cols-2 gap-6 text-gray-600">
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Criar uma Transmissão</h3>
                <ol class="list-decimal list-inside space-y-2">
                  <li>Clique em "Criar Sala"</li>
                  <li>Escolha entre sala pública ou privada</li>
                  <li>Se privada, defina uma senha</li>
                  <li>Digite seu nome (opcional)</li>
                  <li>Permita o acesso à câmera e microfone</li>
                  <li>Compartilhe o link da sua transmissão</li>
                </ol>
              </div>
              <div>
                <h3 class="font-semibold text-gray-800 mb-2">Assistir uma Transmissão</h3>
                <ol class="list-decimal list-inside space-y-2">
                  <li>Escolha uma transmissão ao vivo da lista</li>
                  <li>Digite a senha se for uma sala privada</li>
                  <li>Ou clique em "Chat Aleatório" para uma conversa surpresa</li>
                  <li>Interaja através do chat em tempo real</li>
                  <li>Inicie sua própria transmissão quando quiser</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
