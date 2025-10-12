import { describe, test, expect, beforeAll, beforeEach } from "vitest";
/**
 * Simple tests for the built package constants
 */

import { describe, test, expect } from "vitest";
import { PRINTER_STATUS, PRINTER_STATUS_LABELS } from "../../dist/index.esm.js";

describe("Constants (from built package)", () => {
  describe("PRINTER_STATUS", () => {
    test("contains all expected status values", () => {
      expect(PRINTER_STATUS.IDLE).toBe("idle");
      expect(PRINTER_STATUS.CONNECTING).toBe("connecting");
      expect(PRINTER_STATUS.CONNECTED).toBe("connected");
      expect(PRINTER_STATUS.ERROR).toBe("error");
    });

    test("has exactly 4 status values", () => {
      const statusKeys = Object.keys(PRINTER_STATUS);
      expect(statusKeys).toHaveLength(4);
    });

    test("all values are strings", () => {
      Object.values(PRINTER_STATUS).forEach((status) => {
        expect(typeof status).toBe("string");
        expect(status.length).toBeGreaterThan(0);
      });
    });
  });

  describe("PRINTER_STATUS_LABELS", () => {
    test("has labels for all printer statuses", () => {
      Object.values(PRINTER_STATUS).forEach((status) => {
        expect(PRINTER_STATUS_LABELS[status]).toBeDefined();
        expect(typeof PRINTER_STATUS_LABELS[status]).toBe("string");
        expect(PRINTER_STATUS_LABELS[status].length).toBeGreaterThan(0);
      });
    });

    test("has expected label values", () => {
      expect(PRINTER_STATUS_LABELS[PRINTER_STATUS.IDLE]).toBe("Disconnected");
      expect(PRINTER_STATUS_LABELS[PRINTER_STATUS.CONNECTING]).toBe(
        "Connecting..."
      );
      expect(PRINTER_STATUS_LABELS[PRINTER_STATUS.CONNECTED]).toBe("Connected");
      expect(PRINTER_STATUS_LABELS[PRINTER_STATUS.ERROR]).toBe(
        "Connection Error"
      );
    });
  });
});
