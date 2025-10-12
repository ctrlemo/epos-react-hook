/**
 * Simple tests for the built package EposClient
 */

describe("EposClient (from built package)", () => {
  const { EposClient } = require("../../dist/index.js");

  let client;
  const mockOptions = {
    sdkUrl: "/epos-sdk.js",
    ip: "192.168.1.100",
    port: 8043,
  };

  beforeEach(() => {
    // Clear all mocks and reset state
    jest.clearAllMocks();

    // Reset window.epson mock
    global.window.epson = {
      ePOSDevice: jest.fn().mockImplementation(() => ({
        DEVICE_TYPE_PRINTER: "PRINTER",
        connect: jest.fn(),
        createDevice: jest.fn(),
        deleteDevice: jest.fn(),
        disconnect: jest.fn(),
        isConnected: jest.fn(() => false),
      })),
    };
    global.window.epson.ePOSDevice.DEVICE_TYPE_PRINTER = "PRINTER";
  });

  describe("Constructor", () => {
    test("creates instance with valid options", () => {
      client = new EposClient(mockOptions);
      expect(client).toBeInstanceOf(EposClient);
      expect(client.getEndpoint()).toEqual({
        ip: "192.168.1.100",
        port: 8043,
      });
    });

    test("throws error without sdkUrl", () => {
      expect(() => {
        new EposClient({ ip: "192.168.1.100" });
      }).toThrow("EposClient requires sdkUrl");
    });

    test("throws error without ip", () => {
      expect(() => {
        new EposClient({ sdkUrl: "/sdk.js" });
      }).toThrow("EposClient requires printer IP");
    });

    test("uses default port when not provided", () => {
      const clientWithoutPort = new EposClient({
        sdkUrl: "/sdk.js",
        ip: "192.168.1.100",
      });
      expect(clientWithoutPort.getEndpoint().port).toBe(8043);
    });
  });

  describe("Configuration Methods", () => {
    beforeEach(() => {
      client = new EposClient(mockOptions);
    });

    test("setSdkUrl updates SDK URL", () => {
      const newUrl = "/new-sdk.js";
      client.setSdkUrl(newUrl);
      expect(client.sdkUrl).toBe(newUrl);
      expect(client.sdkLoaded).toBe(false); // Should reset loading state
    });

    test("setEndpoint updates IP and port", () => {
      client.setEndpoint("192.168.1.200", 9100);
      expect(client.getEndpoint()).toEqual({
        ip: "192.168.1.200",
        port: 9100,
      });
    });

    test("getEndpoint returns current configuration", () => {
      const endpoint = client.getEndpoint();
      expect(endpoint).toEqual({
        ip: mockOptions.ip,
        port: mockOptions.port,
      });
    });
  });

  describe("Connection Status", () => {
    beforeEach(() => {
      client = new EposClient(mockOptions);
    });

    test("isConnected returns false when not connected", () => {
      expect(client.isConnected()).toBe(false);
    });

    test("getPrinter returns null when no printer", () => {
      expect(client.getPrinter()).toBeNull();
    });
  });
});
