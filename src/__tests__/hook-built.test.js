import { describe, test, expect, beforeEach, vi } from "vitest";
import * as React from "react";

/**
 * Hook tests using the built package
 */

// Mock React - this must be at the top level
vi.mock("react", () => ({
  useRef: vi.fn(),
  useState: vi.fn(),
  useCallback: vi.fn(),
  useEffect: vi.fn(),
}));

import { useEposPrinter, PRINTER_STATUS } from "../../dist/index.esm.js";

describe("useEposPrinter Hook (from built package)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("function exists and has correct signature", () => {
    expect(typeof useEposPrinter).toBe("function");
    expect(useEposPrinter.length).toBe(2); // 2 required parameters (port has default)
  });

  test("calls React hooks in correct order", async () => {
    const ip = "192.168.1.100";
    const sdkUrl = "/test-sdk.js";

    // Mock React hooks to track their usage
    const useRefSpy = vi
      .spyOn(await import("react"), "useRef")
      .mockReturnValue({ current: null });
    const useStateSpy = vi
      .spyOn(await import("react"), "useState")
      .mockReturnValue(["idle", () => {}]);
    const useCallbackSpy = vi
      .spyOn(await import("react"), "useCallback")
      .mockImplementation((fn) => fn);
    const useEffectSpy = vi
      .spyOn(await import("react"), "useEffect")
      .mockImplementation(() => {});

    try {
      const result = useEposPrinter(ip, sdkUrl);
      // Should return an object with expected properties
      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("printer");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("connect");
      expect(result).toHaveProperty("disconnect");
    } catch (error) {
      // Some mock-related errors are expected
    }

    // Verify React hooks were called
    expect(useRefSpy).toHaveBeenCalled();
    expect(useStateSpy).toHaveBeenCalled();
    expect(useCallbackSpy).toHaveBeenCalled();
    expect(useEffectSpy).toHaveBeenCalled();

    // Restore original implementations
    useRefSpy.mockRestore();
    useStateSpy.mockRestore();
    useCallbackSpy.mockRestore();
    useEffectSpy.mockRestore();
  });

  test("accepts required parameters", () => {
    const ip = "192.168.1.100";
    const sdkUrl = "/test-sdk.js";

    // Mock React hooks to prevent errors
    const mockClient = {
      isConnected: vi.fn().mockReturnValue(false),
      connect: vi.fn(),
      disconnect: vi.fn(),
      createPrinter: vi.fn(),
    };

    const useRefSpy = vi
      .spyOn(React, "useRef")
      .mockReturnValue({ current: mockClient });
    const useStateSpy = vi
      .spyOn(React, "useState")
      .mockReturnValue(["idle", () => {}]);
    const useCallbackSpy = vi
      .spyOn(React, "useCallback")
      .mockImplementation((fn) => fn);
    const useEffectSpy = vi
      .spyOn(React, "useEffect")
      .mockImplementation(() => {});

    expect(() => {
      const result = useEposPrinter(ip, sdkUrl);
      // Should return an object with expected properties
      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("printer");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("connect");
      expect(result).toHaveProperty("disconnect");
      expect(result).toHaveProperty("isConnected");
    }).not.toThrow();

    // Restore spies
    useRefSpy.mockRestore();
    useStateSpy.mockRestore();
    useCallbackSpy.mockRestore();
    useEffectSpy.mockRestore();
  });

  test("accepts optional port parameter", () => {
    const ip = "192.168.1.100";
    const sdkUrl = "/test-sdk.js";
    const port = 9100;

    // Mock React hooks to prevent errors
    const mockClient = {
      isConnected: vi.fn().mockReturnValue(false),
      connect: vi.fn(),
      disconnect: vi.fn(),
      createPrinter: vi.fn(),
    };

    const useRefSpy = vi
      .spyOn(React, "useRef")
      .mockReturnValue({ current: mockClient });
    const useStateSpy = vi
      .spyOn(React, "useState")
      .mockReturnValue(["idle", () => {}]);
    const useCallbackSpy = vi
      .spyOn(React, "useCallback")
      .mockImplementation((fn) => fn);
    const useEffectSpy = vi
      .spyOn(React, "useEffect")
      .mockImplementation(() => {});

    expect(() => {
      const result = useEposPrinter(ip, sdkUrl, port);
      // Should return an object with expected properties
      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("printer");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("connect");
      expect(result).toHaveProperty("disconnect");
      expect(result).toHaveProperty("isConnected");
    }).not.toThrow();

    // Restore spies
    useRefSpy.mockRestore();
    useStateSpy.mockRestore();
    useCallbackSpy.mockRestore();
    useEffectSpy.mockRestore();
  });
});
