import { Handlers, PageProps } from "$fresh/server.ts";

import BackButton from "../../islands/BackButton.tsx";
import { Head } from "$fresh/runtime.ts";
import VideoChat from "../../islands/VideoChat.tsx";

interface Data {
  id: string;
  chatOnly: boolean;
  userName?: string;
  isPrivate: boolean;
  password?: string;
  streamOnly: boolean;
}

export const handler: Handlers<Data> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const { id } = ctx.params;
    const chatOnly = url.searchParams.get("chatOnly") === "true";
    const userName = url.searchParams.get("userName") || undefined;
    const isPrivate = url.searchParams.get("isPrivate") === "true";
    const password = url.searchParams.get("password") || undefined;
    const streamOnly = url.searchParams.get("streamOnly") === "true";

    return ctx.render({
      id,
      chatOnly,
      userName,
      isPrivate,
      password,
      streamOnly
    });
  },
};

export default function Sala({ data }: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>{data.chatOnly ? "Chat" : "Sala"} - Roleta Online</title>
      </Head>
      <div class="min-h-screen bg-gray-100">
        <nav class="bg-white shadow-md p-4">
          <div class="container mx-auto">
            <BackButton />
          </div>
        </nav>
        <VideoChat
          roomId={data.id}
          chatOnly={data.chatOnly}
          userName={data.userName}
          isPrivate={data.isPrivate}
          password={data.password}
          streamOnly={data.streamOnly}
        />
      </div>
    </>
  );
} 