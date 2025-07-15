// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: "client", // 👉 index.html이 있는 디렉토리를 명시해줘야 함
    plugins: [react()],
    define: {
      "import.meta.env": {
        VITE_FIREBASE_API_KEY: JSON.stringify(env.VITE_FIREBASE_API_KEY),
        VITE_FIREBASE_AUTH_DOMAIN: JSON.stringify(
          env.VITE_FIREBASE_AUTH_DOMAIN,
        ),
        VITE_FIREBASE_PROJECT_ID: JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
        VITE_FIREBASE_STORAGE_BUCKET: JSON.stringify(
          env.VITE_FIREBASE_STORAGE_BUCKET,
        ),
        VITE_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(
          env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        ),
        VITE_FIREBASE_APP_ID: JSON.stringify(env.VITE_FIREBASE_APP_ID),
        VITE_FIREBASE_MEASUREMENT_ID: JSON.stringify(
          env.VITE_FIREBASE_MEASUREMENT_ID,
        ),
      },
    },
  };
});
