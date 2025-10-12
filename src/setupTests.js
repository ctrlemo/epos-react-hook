import { vi } from "vitest";

// Mock the Epson SDK since it won't be available in test environment
global.window = global.window || {};
global.document = global.document || {};

// Mock Epson SDK
global.window.epson = {
  ePOSDevice: function () {
    return {
      DEVICE_TYPE_PRINTER: "PRINTER",
      connect: vi.fn(),
      createDevice: vi.fn(),
      deleteDevice: vi.fn(),
      disconnect: vi.fn(),
      isConnected: vi.fn(() => false),
    };
  },
};

global.window.epson.ePOSDevice.DEVICE_TYPE_PRINTER = "PRINTER";

// Mock DOM methods
global.document.createElement = vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  src: "",
  async: false,
  onload: null,
  onerror: null,
}));

global.document.querySelector = vi.fn(() => null);

// Mock document.body.appendChild - override the property descriptor
Object.defineProperty(global.document.body, "appendChild", {
  value: vi.fn(),
  writable: true,
});

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();

  // Mock console methods
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
