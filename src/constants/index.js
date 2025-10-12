/**
 * Printer Connection Status Constants
 *
 * These represent the lifecycle states of a printer connection:
 * IDLE → CONNECTING → CONNECTED
 *                  ↘ ERROR
 */
export const PRINTER_STATUS = {
  IDLE: "idle", // Not connected, ready to connect
  CONNECTING: "connecting", // Connection attempt in progress
  CONNECTED: "connected", // Successfully connected and ready
  ERROR: "error", // Connection failed or disconnected with error
};

/**
 * Human-readable status labels for UI display
 */
export const PRINTER_STATUS_LABELS = {
  [PRINTER_STATUS.IDLE]: "Disconnected",
  [PRINTER_STATUS.CONNECTING]: "Connecting...",
  [PRINTER_STATUS.CONNECTED]: "Connected",
  [PRINTER_STATUS.ERROR]: "Connection Error",
};
