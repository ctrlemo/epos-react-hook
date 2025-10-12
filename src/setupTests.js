require("@testing-library/jest-dom");

// Mock the Epson SDK since it won't be available in test environment
global.window = global.window || {};
global.document = global.document || {};

// Mock Epson SDK
global.window.epson = {
  ePOSDevice: function () {
    return {
      DEVICE_TYPE_PRINTER: "PRINTER",
      connect: jest.fn(),
      createDevice: jest.fn(),
      deleteDevice: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn(() => false),
    };
  },
};

global.window.epson.ePOSDevice.DEVICE_TYPE_PRINTER = "PRINTER";

// Mock DOM methods
global.document.createElement = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  src: "",
  async: false,
  onload: null,
  onerror: null,
}));

global.document.querySelector = jest.fn(() => null);

// Mock document.body.appendChild - override the property descriptor
Object.defineProperty(global.document.body, "appendChild", {
  value: jest.fn(),
  writable: true,
});

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();

  // Mock console methods
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
