// useEposPrinter.js
import { useEffect, useState, useCallback, useRef } from "react";
import EposClient from "../services/epos/epson/eposClient";
import { PRINTER_STATUS, PRINTER_STATUS_LABELS } from "../constants";

/**
 * React hook for managing Epson ePOS printer connections and operations.
 *
 * This hook provides a complete interface for connecting to, managing, and
 * disconnecting from Epson thermal printers. It handles the entire printer
 * lifecycle including SDK loading, connection establishment, device creation,
 * and cleanup.
 *
 * Features:
 * - Automatic connection lifecycle management
 * - Connection reuse (avoids redundant reconnections)
 * - Cleanup on component unmount
 * - Real-time status tracking
 *
 * @param {string} ip - The IP address or hostname of the Epson printer (e.g., "192.168.1.100" or "myeposprinter")
 * @param {string} sdkUrl - URL path to the Epson ePOS SDK JavaScript file. E.g., "/epos/epos-2.20.0.js" or `${process.env.PUBLIC_URL}/epos/epos-2.20.0.js`
 * @param {number} [port=8043] - The port number for the printer connection. Standard ePOS port is 8043
 *
 * @returns {Object} Hook return object
 * @returns {Object|null} returns.printer - The current Epson printer device object. Use this to send print commands. Null when disconnected.
 * @returns {string} returns.status - Current connection status. One of: "idle", "connecting", "connected", "error"
 * @returns {string|null} returns.error - Error message from the last failed operation, or null if no error
 * @returns {Function} returns.connect - Async function to establish printer connection. Returns Promise<printer|null>
 * @returns {Function} returns.disconnect - Async function to close printer connection and cleanup resources
 * @returns {Function} returns.isConnected - Synchronous function that returns boolean connection status
 *
 * @example
 * ```javascript
 * // Basic usage
 * const { printer, status, connect, disconnect, error } = useEposPrinter(
 *   "192.168.1.100",
 *   "/epos/epos-2.20.0.js"
 * );
 *
 * // Connect to printer
 * const handleConnect = async () => {
 *   const printerObj = await connect();
 *   if (printerObj) {
 *     console.debug("Printer connected successfully");
 *   }
 * };
 *
 * // Check status
 * if (status === "connected") {
 *   // Ready to print
 * }
 * ```
 *
 * @example
 * ```javascript
 * // Using with localStorage IP
 * const { printer, status, connect } = useEposPrinter(
 *   localStorage.getItem("printerIP"),
 *   `${process.env.PUBLIC_URL}/epos/epos-2.20.0.js`
 * );
 * ```
 *
 * @since 2.0.0
 */
export function useEposPrinter(ip, sdkUrl, port = 8043) {
  // STATE MANAGEMENT
  const clientRef = useRef(null); // Will be created on mount or when config changes
  const printerRef = useRef(null);
  const [status, setStatus] = useState(PRINTER_STATUS.IDLE);
  const [error, setError] = useState(null);

  // Create EposClient on mount or when ip/sdkUrl/port change
  useEffect(() => {
    clientRef.current = new EposClient({ sdkUrl, ip, port });
    console.debug("useEposPrinter mounted, EposClient created", {
      sdkUrl,
      ip,
      port,
    });
    return () => {
      if (clientRef.current) {
        console.debug(
          "useEposPrinter unmounted, cleaning up printer connection",
        );
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [ip, sdkUrl, port]);

  /**
   * CONNECT FUNCTION
   *
   * This wraps the EposClient's async operations and updates React state.
   *
   * Flow:
   * 1. Set status to "connecting" (triggers UI updates)
   * 2. Call client.connect() - establishes network connection
   * 3. Call client.createPrinter() - creates printer device object
   * 4. Update state with success/failure results
   *
   * Why useCallback? Prevents function recreation on every render,
   * which would cause unnecessary effect dependencies to fire.
   *
   * @returns {Promise<Object|null>} Promise that resolves to printer device object on success, null on failure
   */
  async function connect() {
    setStatus(PRINTER_STATUS.CONNECTING);
    setError(null);
    try {
      if (!clientRef.current) {
        throw new Error(
          "EposClient not initialized. This is a bug: clientRef should always be created by useEffect.",
        );
      }
      await clientRef.current.connect();
      const printerObj = await clientRef.current.createPrinter();
      printerRef.current = printerObj;
      setStatus(PRINTER_STATUS.CONNECTED);
      return printerObj;
    } catch (err) {
      console.error("Printer connection failed:", err);
      setError(err.message);
      setStatus(PRINTER_STATUS.ERROR);
      printerRef.current = null;
      return null;
    }
  }

  /**
   * DISCONNECT FUNCTION
   *
   * Cleanly closes connection and resets state.
   *
   * Why async? client.disconnect() returns a Promise (it needs to
   * delete printer device and close network connection in order).
   *
   * @returns {Promise<void>} Promise that resolves when disconnection is complete
   */
  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
      // clientRef.current = null;
    }
    printerRef.current = null;
    setStatus(PRINTER_STATUS.IDLE);
  }, []);

  /**
   * CONNECTION MONITORING (Currently Disabled)
   *
   * This effect would periodically check if the printer is still connected.
   * Useful because network printers can disconnect unexpectedly.
   */
  // useEffect(() => {
  //   if (status !== "connected") return; // Only monitor when connected

  //   const interval = setInterval(() => {
  //     // Use EposClient's isConnected method to check status
  //     const stillConnected = clientRef.current.isConnected();
  //     if (!stillConnected) {
  //       console.warn("Device disconnected unexpectedly");
  //       disconnect(); // Clean up and reset state
  //     }
  //   }, 3000); // Check every 3 seconds

  //   return () => clearInterval(interval); // Cleanup interval on unmount
  // }, [status, disconnect]);

  /**
   * CLEANUP ON UNMOUNT
   *
   * Ensures we don't leave dangling printer connections when component unmounts.
   * The empty dependency array [] means this effect only runs on mount/unmount.
   */
  // (Lifecycle handled above)

  /**
   * RETURN OBJECT
   *
   * This is what components get when they call useEposPrinter():
   */
  return {
    printer: printerRef.current, // Current printer device object
    status, // Connection status string
    error, // Error message (if any)
    connect, // Function to initiate connection
    disconnect, // Function to close connection
    isConnected: () => {
      if (!clientRef.current) return false;
      return clientRef.current.isConnected();
    },
  };
}
