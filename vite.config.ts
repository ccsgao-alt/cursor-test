import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { weatherApiPlugin } from "./vite.weatherApi";

export default defineConfig({
  plugins: [react(), weatherApiPlugin()],
});
