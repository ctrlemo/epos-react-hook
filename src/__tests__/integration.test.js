/**
 * Integration tests to verify the package works as expected when consumed
 */

describe("Package Integration", () => {
  test("can import and use all exports together", () => {
    const {
      useEposPrinter,
      EposClient,
      PRINTER_STATUS,
      PRINTER_STATUS_LABELS,
      isValidPrinterStatus,
    } = require("../../dist/index.js");

    // Verify they all work together
    expect(isValidPrinterStatus(PRINTER_STATUS.CONNECTED)).toBe(true);
    expect(PRINTER_STATUS_LABELS[PRINTER_STATUS.CONNECTED]).toBeDefined();

    // Verify EposClient can be instantiated
    const client = new EposClient({
      sdkUrl: "/test.js",
      ip: "192.168.1.100",
    });
    expect(client).toBeInstanceOf(EposClient);

    // Verify hook is a function
    expect(typeof useEposPrinter).toBe("function");
  });

  test("constants work together across the package", () => {
    const {
      PRINTER_STATUS,
      PRINTER_STATUS_LABELS,
      isValidPrinterStatus,
    } = require("../../dist/index.js");

    // Test that all status constants work with utility functions
    Object.values(PRINTER_STATUS).forEach((status) => {
      expect(isValidPrinterStatus(status)).toBe(true);
      expect(PRINTER_STATUS_LABELS[status]).toBeDefined();
    });
  });

  test("EposClient and useEposPrinter work with same parameters", () => {
    const { useEposPrinter, EposClient } = require("../../dist/index.js");

    const testParams = {
      sdkUrl: "/test-sdk.js",
      ip: "192.168.1.100",
      port: 8043,
    };

    // EposClient should accept parameters
    expect(() => {
      new EposClient(testParams);
    }).not.toThrow();

    // Hook function should exist and be callable (we can't test calling it without React context)
    expect(typeof useEposPrinter).toBe("function");
    expect(useEposPrinter.length).toBe(2); // Shows 2 required parameters (third has default value)
  });

  test("package can be used in CommonJS environment", () => {
    // This test verifies the built package works with require()
    const eposPackage = require("../../dist/index.js");

    expect(eposPackage).toBeDefined();
    expect(typeof eposPackage).toBe("object");

    // Check that all expected exports are present
    const expectedExports = [
      "useEposPrinter",
      "EposClient",
      "PRINTER_STATUS",
      "PRINTER_STATUS_LABELS",
      "isValidPrinterStatus",
    ];

    expectedExports.forEach((exportName) => {
      expect(eposPackage[exportName]).toBeDefined();
    });
  });

  test("no circular dependencies or conflicts", () => {
    // Import the package multiple times to ensure no conflicts
    const import1 = require("../../dist/index.js");
    const import2 = require("../../dist/index.js");

    // Should be the same reference (cached by Node.js)
    expect(import1).toBe(import2);

    // Constants should be identical
    expect(import1.PRINTER_STATUS).toBe(import2.PRINTER_STATUS);
    expect(import1.PRINTER_STATUS_LABELS).toBe(import2.PRINTER_STATUS_LABELS);
  });

  test("package size and structure is reasonable", () => {
    const eposPackage = require("../../dist/index.js");
    const exportCount = Object.keys(eposPackage).length;

    // Should not export too many things (keeps API clean)
    expect(exportCount).toBeLessThanOrEqual(10);
    expect(exportCount).toBeGreaterThanOrEqual(3);

    // Main exports should not be deeply nested
    expect(typeof eposPackage.useEposPrinter).toBe("function");
    expect(typeof eposPackage.EposClient).toBe("function");
    expect(typeof eposPackage.PRINTER_STATUS).toBe("object");
  });
});
