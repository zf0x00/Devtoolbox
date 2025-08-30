import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage"],
  },
});
