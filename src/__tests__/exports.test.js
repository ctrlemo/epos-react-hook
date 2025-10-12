import { describe, test, expect, beforeAll, beforeEach } from "vitest";
/**
 * Package Export Tests
 *
 * These tests verify that the built package exports all expected modules
 * and that they have the correct types and functionality.
 */

import { describe, test, expect, beforeAll } from "vitest";

describe("Package Exports", () => {
  let packageExports;

  beforeAll(async () => {
    // Import from the built distribution
    packageExports = await import("../../dist/index.esm.js");
  });

  describe("Named Exports", () => {
    test("exports useEposPrinter hook", () => {
      expect(packageExports.useEposPrinter).toBeDefined();
      expect(typeof packageExports.useEposPrinter).toBe("function");
    });

    test("exports EposClient class", () => {
      expect(packageExports.EposClient).toBeDefined();
      expect(typeof packageExports.EposClient).toBe("function");
      // Verify it's a constructor function
      expect(packageExports.EposClient.prototype).toBeDefined();
    });

    test("exports PRINTER_STATUS constants", () => {
      expect(packageExports.PRINTER_STATUS).toBeDefined();
      expect(typeof packageExports.PRINTER_STATUS).toBe("object");

      // Verify all expected status values
      expect(packageExports.PRINTER_STATUS.IDLE).toBe("idle");
      expect(packageExports.PRINTER_STATUS.CONNECTING).toBe("connecting");
      expect(packageExports.PRINTER_STATUS.CONNECTED).toBe("connected");
      expect(packageExports.PRINTER_STATUS.ERROR).toBe("error");
    });

    test("exports PRINTER_STATUS_LABELS", () => {
      expect(packageExports.PRINTER_STATUS_LABELS).toBeDefined();
      expect(typeof packageExports.PRINTER_STATUS_LABELS).toBe("object");

      // Verify labels exist for all statuses
      expect(packageExports.PRINTER_STATUS_LABELS.idle).toBeDefined();
      expect(packageExports.PRINTER_STATUS_LABELS.connecting).toBeDefined();
      expect(packageExports.PRINTER_STATUS_LABELS.connected).toBeDefined();
      expect(packageExports.PRINTER_STATUS_LABELS.error).toBeDefined();
    });

    test("exports isValidPrinterStatus utility", () => {
      expect(packageExports.isValidPrinterStatus).toBeDefined();
      expect(typeof packageExports.isValidPrinterStatus).toBe("function");
    });
  });

  describe("Export Completeness", () => {
    test("exports expected number of named exports", () => {
      const exportKeys = Object.keys(packageExports);
      const expectedExports = [
        "useEposPrinter",
        "EposClient",
        "PRINTER_STATUS",
        "PRINTER_STATUS_LABELS",
        "isValidPrinterStatus",
      ];

      expectedExports.forEach((exportName) => {
        expect(exportKeys).toContain(exportName);
      });
    });

    test("does not export unexpected items", () => {
      const exportKeys = Object.keys(packageExports);
      const allowedExports = [
        "useEposPrinter",
        "EposClient",
        "PRINTER_STATUS",
        "PRINTER_STATUS_LABELS",
        "isValidPrinterStatus",
      ];

      exportKeys.forEach((key) => {
        expect(allowedExports).toContain(key);
      });
    });
  });

  describe("Export Values Validation", () => {
    test("PRINTER_STATUS contains only expected values", () => {
      const expectedStatuses = ["idle", "connecting", "connected", "error"];
      const actualStatuses = Object.values(packageExports.PRINTER_STATUS);

      expectedStatuses.forEach((status) => {
        expect(actualStatuses).toContain(status);
      });

      expect(actualStatuses.length).toBe(expectedStatuses.length);
    });

    test("PRINTER_STATUS_LABELS maps all status values", () => {
      const statusValues = Object.values(packageExports.PRINTER_STATUS);

      statusValues.forEach((status) => {
        expect(packageExports.PRINTER_STATUS_LABELS[status]).toBeDefined();
        expect(typeof packageExports.PRINTER_STATUS_LABELS[status]).toBe(
          "string"
        );
        expect(
          packageExports.PRINTER_STATUS_LABELS[status].length
        ).toBeGreaterThan(0);
      });
    });
  });
});
