/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.js"],
    include: [
      "src/**/__tests__/**/*.(js|jsx)",
      "src/**/?(*.)(test|spec).(js|jsx)",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.{js,jsx}", "src/setupTests.js"],
    },
  },
});
