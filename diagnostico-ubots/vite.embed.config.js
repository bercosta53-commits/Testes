import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Gera dist/ubots-diagnostico.js (um único arquivo, com CSS embutido).
export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": '"production"' },
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: { entry: "src/embed.jsx", formats: ["iife"], name: "UbotsDiagnostico", fileName: () => "ubots-diagnostico.js" },
  },
});
