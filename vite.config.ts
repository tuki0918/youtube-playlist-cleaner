import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { type PluginOption, defineConfig } from "vite";
import manifest from "./manifest.config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    // as PluginOption is a workaround for a bug in the tailwindcss plugin
    tailwindcss() as unknown as PluginOption,
  ],
});
