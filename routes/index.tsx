import { Handlers, PageProps } from "$fresh/server.ts";

import { Head } from "$fresh/runtime.ts";
import HomePage from "../islands/HomePage.tsx";
import LanguageSwitcher from "../islands/LanguageSwitcher.tsx";
import type { Room } from "../types/room.ts";
import { getRooms } from "../utils/rooms.ts";
import { h } from "preact";

export const handler: Handlers<Room[]> = {
  async GET(_req, ctx) {
    try {
      const rooms = getRooms().map(room => ({
        ...room,
        isPrivate: false // Temporariamente definido como false até implementarmos salas privadas
      }));
      return ctx.render(rooms);
    } catch (error) {
      console.error("Erro ao buscar salas:", error);
      return ctx.render([]);
    }
  },
};

export default function Home({ data: rooms }: PageProps<Room[]>) {
  return (
    <>
      <a href="https://github.com/ktfth/roleta-online">
        <img 
          decoding="async" 
          width="149" 
          height="149" 
          src="https://github.blog/wp-content/uploads/2008/12/forkme_left_green_007200.png" 
          style={{position: 'absolute', top: 0, left: 0, border: 0}} 
          alt="Fork me on GitHub" 
          loading="lazy" 
        />
      </a>
      <LanguageSwitcher />
      <Head>
        <title>Roleta Online - Chat com Vídeo</title>
      </Head>
      <HomePage rooms={rooms} />
    </>
  );
}
