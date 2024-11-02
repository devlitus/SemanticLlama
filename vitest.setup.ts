import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock de process.env
vi.mock("process", () => ({
  env: {
    NODE_ENV: "test",
    DEV: false,
    PROD: false,
  },
}));

// Silenciar console logs en tests
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();
