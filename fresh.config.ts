import { defineConfig } from "$fresh/server.ts";
import twindConfig from "./twind.config.ts";
import twindPlugin from "$fresh/plugins/twind.ts";

export default defineConfig({
  plugins: [twindPlugin(twindConfig)],
  build: {
    target: ["chrome99", "firefox99", "safari15"],
  },
});
