// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_health from "./routes/api/health.ts";
import * as $api_joke from "./routes/api/joke.ts";
import * as $api_rooms from "./routes/api/rooms.ts";
import * as $api_rooms_id_ from "./routes/api/rooms/[id].ts";
import * as $api_rooms_id_verify from "./routes/api/rooms/[id]/verify.ts";
import * as $api_ws from "./routes/api/ws.ts";
import * as $chat_id_ from "./routes/chat/[id].tsx";
import * as $chat_new from "./routes/chat/new.ts";
import * as $chat_random from "./routes/chat/random.ts";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $sala_id_ from "./routes/sala/[id].tsx";
import * as $sala_nova from "./routes/sala/nova.tsx";
import * as $BackButton from "./islands/BackButton.tsx";
import * as $Counter from "./islands/Counter.tsx";
import * as $CreateRoom from "./islands/CreateRoom.tsx";
import * as $HomePage from "./islands/HomePage.tsx";
import * as $LanguageSwitcher from "./islands/LanguageSwitcher.tsx";
import * as $RoomList from "./islands/RoomList.tsx";
import * as $VideoChat from "./islands/VideoChat.js";
import * as $VideoChat_1 from "./islands/VideoChat.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/health.ts": $api_health,
    "./routes/api/joke.ts": $api_joke,
    "./routes/api/rooms.ts": $api_rooms,
    "./routes/api/rooms/[id].ts": $api_rooms_id_,
    "./routes/api/rooms/[id]/verify.ts": $api_rooms_id_verify,
    "./routes/api/ws.ts": $api_ws,
    "./routes/chat/[id].tsx": $chat_id_,
    "./routes/chat/new.ts": $chat_new,
    "./routes/chat/random.ts": $chat_random,
    "./routes/greet/[name].tsx": $greet_name_,
    "./routes/index.tsx": $index,
    "./routes/sala/[id].tsx": $sala_id_,
    "./routes/sala/nova.tsx": $sala_nova,
  },
  islands: {
    "./islands/BackButton.tsx": $BackButton,
    "./islands/Counter.tsx": $Counter,
    "./islands/CreateRoom.tsx": $CreateRoom,
    "./islands/HomePage.tsx": $HomePage,
    "./islands/LanguageSwitcher.tsx": $LanguageSwitcher,
    "./islands/RoomList.tsx": $RoomList,
    "./islands/VideoChat.js": $VideoChat,
    "./islands/VideoChat.tsx": $VideoChat_1,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
