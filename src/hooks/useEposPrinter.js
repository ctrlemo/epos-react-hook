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
 *     console.log("Printer connected successfully");
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
  /**
   * STATE MANAGEMENT
   *
   * These track the current state of our printer connection:
   * - printer: The actual Epson printer device object (null when disconnected)
   * - status: Connection lifecycle ("idle" → "connecting" → "connected" | "error")
   * - error: Any error messages from failed operations
   */
  const clientRef = useRef(new EposClient({ sdkUrl, ip, port })); // Use useRef for the client instance
  const printerRef = useRef(null); // Use useRef for the printer object
  const [status, setStatus] = useState(PRINTER_STATUS.IDLE); // idle | connecting | connected | error
  const [error, setError] = useState(null);

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
  const connect = useCallback(async () => {
    setStatus(PRINTER_STATUS.CONNECTING); // UI can show "Connecting..." spinner
    setError(null); // Clear any previous errors

    try {
      // Step 1: Establish network connection to printer
      await clientRef.current.connect();

      // Step 2: Create printer device object for sending commands
      const printerObj = await clientRef.current.createPrinter();

      // Step 3: Update React state with successful connection
      printerRef.current = printerObj; // Store printer object for use
      setStatus(PRINTER_STATUS.CONNECTED); // UI can show "Connected" status
      return printerObj; // Return printer object for immediate use if needed
    } catch (err) {
      // Handle any errors in the connection process
      console.error("Printer connection failed:", err);
      setError(err.message); // Store error message for UI
      setStatus(PRINTER_STATUS.ERROR); // UI can show error state
      printerRef.current = null; // Ensure printer is null on failure
      return null; // Indicate failure to caller
    }
  }, []); // Dependencies: recreate if these change

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
    await clientRef.current.disconnect(); // Clean up resources in EposClient
    printerRef.current = null; // Clear printer reference
    setStatus(PRINTER_STATUS.IDLE); // Reset to initial state
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
  useEffect(() => {
    const clientInstance = clientRef.current;
    return () => clientInstance.disconnect(); // Cleanup function runs on unmount
  }, []);

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
    isConnected: clientRef.current.isConnected.bind(clientRef.current), // Bound method for checking status
  };
}
