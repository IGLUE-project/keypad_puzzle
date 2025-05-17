import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ mode }) => {
  let _ESCAPP_REUSABLE_PUZZLE_SETTINGS = {};
  try {
    if (mode === "development") {
      _ESCAPP_REUSABLE_PUZZLE_SETTINGS = await import("./config.js").then((mod) => mod.ESCAPP_REUSABLE_PUZZLE_SETTINGS);
    }
  } catch(e){}

  return {
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    define: {
      ESCAPP_REUSABLE_PUZZLE_SETTINGS: mode === "development"
        ? JSON.stringify(_ESCAPP_REUSABLE_PUZZLE_SETTINGS)
        : "undefined",
    },
  };
});