import { describe, test, expect, beforeAll, beforeEach } from "vitest";
/**
 * Simple tests for the built package utilities
 */

import { describe, test, expect } from "vitest";
import { isValidPrinterStatus, PRINTER_STATUS } from "../../dist/index.esm.js";

describe("Utilities (from built package)", () => {
  describe("isValidPrinterStatus", () => {
    test("returns true for valid printer statuses", () => {
      expect(isValidPrinterStatus(PRINTER_STATUS.IDLE)).toBe(true);
      expect(isValidPrinterStatus(PRINTER_STATUS.CONNECTING)).toBe(true);
      expect(isValidPrinterStatus(PRINTER_STATUS.CONNECTED)).toBe(true);
      expect(isValidPrinterStatus(PRINTER_STATUS.ERROR)).toBe(true);
    });

    test("returns true for string values of valid statuses", () => {
      expect(isValidPrinterStatus("idle")).toBe(true);
      expect(isValidPrinterStatus("connecting")).toBe(true);
      expect(isValidPrinterStatus("connected")).toBe(true);
      expect(isValidPrinterStatus("error")).toBe(true);
    });

    test("returns false for invalid printer statuses", () => {
      expect(isValidPrinterStatus("invalid")).toBe(false);
      expect(isValidPrinterStatus("disconnected")).toBe(false);
      expect(isValidPrinterStatus("ready")).toBe(false);
      expect(isValidPrinterStatus("printing")).toBe(false);
    });

    test("returns false for non-string values", () => {
      expect(isValidPrinterStatus("")).toBe(false);
      expect(isValidPrinterStatus(null)).toBe(false);
      expect(isValidPrinterStatus(undefined)).toBe(false);
      expect(isValidPrinterStatus(123)).toBe(false);
      expect(isValidPrinterStatus({})).toBe(false);
      expect(isValidPrinterStatus([])).toBe(false);
      expect(isValidPrinterStatus(true)).toBe(false);
      expect(isValidPrinterStatus(false)).toBe(false);
    });

    test("is case sensitive", () => {
      expect(isValidPrinterStatus("IDLE")).toBe(false);
      expect(isValidPrinterStatus("Idle")).toBe(false);
      expect(isValidPrinterStatus("CONNECTED")).toBe(false);
      expect(isValidPrinterStatus("Connected")).toBe(false);
    });

    test("handles edge cases", () => {
      expect(isValidPrinterStatus(" idle ")).toBe(false); // Whitespace
      expect(isValidPrinterStatus("idle\n")).toBe(false); // Newline
      expect(isValidPrinterStatus("idle\t")).toBe(false); // Tab
    });
  });
});
