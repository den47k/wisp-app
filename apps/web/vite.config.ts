import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  // Required for Tauri later
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "esnext",
    sourcemap: true,
  },
});
