import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import VideoChat from "../../islands/VideoChat.tsx";
import { h } from "preact";

export default function ChatRoom(props: PageProps) {
  const { id } = props.params;

  return (
    <>
      <Head>
        <title>Chat - Sala {id}</title>
      </Head>
      <div class="min-h-screen bg-gray-100">
        <header class="bg-white shadow">
          <div class="max-w-7xl mx-auto py-6 px-4">
            <div class="flex justify-between items-center">
              <h1 class="text-3xl font-bold text-gray-900">
                Sala de Chat #{id}
              </h1>
              <a
                href="/"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                Voltar
              </a>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">
            <VideoChat roomId={id} />
          </div>
        </main>
      </div>
    </>
  );
} 