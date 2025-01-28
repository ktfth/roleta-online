import BackButton from "../../islands/BackButton.tsx";
import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import VideoChat from "../../islands/VideoChat.tsx";
import { h } from "preact";

export default function ChatRoom(props: PageProps) {
  const id = props.params.id;
  const url = new URL(props.url);
  const chatOnly = url.searchParams.get("chatOnly") === "true";
  const isPrivate = url.searchParams.get("private") === "true";
  const streamOnly = url.searchParams.get("streamOnly") === "true";

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
              <BackButton style="chat" />
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">
            <VideoChat 
              roomId={id} 
              chatOnly={chatOnly} 
              isPrivate={isPrivate}
              streamOnly={streamOnly}
            />
          </div>
        </main>
      </div>
    </>
  );
} 