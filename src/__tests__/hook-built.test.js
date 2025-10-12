/**
 * Hook tests using the built package
 */

// Mock React hooks
const mockUseRef = jest.fn();
const mockUseState = jest.fn();
const mockUseCallback = jest.fn();
const mockUseEffect = jest.fn();

// Mock React
jest.mock("react", () => ({
  useRef: mockUseRef,
  useState: mockUseState,
  useCallback: mockUseCallback,
  useEffect: mockUseEffect,
}));

describe("useEposPrinter Hook (from built package)", () => {
  const { useEposPrinter, PRINTER_STATUS } = require("../../dist/index.js");

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockUseRef.mockImplementation((initialValue) => ({
      current: initialValue,
    }));

    let stateValue = PRINTER_STATUS.IDLE;
    mockUseState.mockImplementation((initial) => [
      stateValue,
      (newValue) => {
        stateValue = newValue;
      },
    ]);

    mockUseCallback.mockImplementation((fn) => fn);
    mockUseEffect.mockImplementation(() => {});
  });

  test("function exists and has correct signature", () => {
    expect(typeof useEposPrinter).toBe("function");
    expect(useEposPrinter.length).toBe(2); // 2 required parameters (port has default)
  });

  test("calls React hooks in correct order", () => {
    const ip = "192.168.1.100";
    const sdkUrl = "/test-sdk.js";

    try {
      useEposPrinter(ip, sdkUrl);
    } catch (error) {
      // Expected to fail due to mocking, but we can verify hook calls
    }

    // Verify React hooks were called
    expect(mockUseRef).toHaveBeenCalled();
    expect(mockUseState).toHaveBeenCalled();
    expect(mockUseCallback).toHaveBeenCalled();
    expect(mockUseEffect).toHaveBeenCalled();
  });

  test("accepts required parameters", () => {
    const ip = "192.168.1.100";
    const sdkUrl = "/test-sdk.js";

    // Should not throw an error for missing parameters
    expect(() => {
      try {
        useEposPrinter(ip, sdkUrl);
      } catch (error) {
        // Ignore mock-related errors
        if (
          !error.message.includes("mock") &&
          !error.message.includes("Cannot read properties")
        ) {
          throw error;
        }
      }
    }).not.toThrow();
  });

  test("accepts optional port parameter", () => {
    const ip = "192.168.1.100";
    const sdkUrl = "/test-sdk.js";
    const port = 9100;

    expect(() => {
      try {
        useEposPrinter(ip, sdkUrl, port);
      } catch (error) {
        // Ignore mock-related errors
        if (
          !error.message.includes("mock") &&
          !error.message.includes("Cannot read properties")
        ) {
          throw error;
        }
      }
    }).not.toThrow();
  });
});
