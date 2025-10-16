// eposClient.js

/**
 * EposClient - A wrapper around Epson's ePOS SDK for thermal printer communication
 *
 * Lifecycle:
 * 1. Dynamically loads the Epson SDK script
 * 2. Establishes network connection to printer
 * 3. Creates printer device objects for actual printing
 * 4. Handles cleanup and disconnection
 *
 * Features:
 * - Connection reuse (avoids redundant reconnections)
 * - Automatic stale connection cleanup
 * - Printer device object reuse
 */
export default class EposClient {
  /**
   * Creates an instance of EposClient
   *
   * @param {Object} options - Configuration options
   * @param {string} options.sdkUrl - URL to the Epson ePOS SDK script
   * @param {string} options.ip - Printer IP address or hostname
   * @param {number} [options.port=8043] - Printer port (default: 8043)
   * @throws {Error} If sdkUrl or ip are not provided
   */
  constructor({ sdkUrl, ip, port = 8043 } = {}) {
    this.device = null; // The ePOSDevice instance (network connection)
    this.printer = null; // The printer device object (for sending print commands)

    if (!sdkUrl) {
      throw new Error("EposClient requires sdkUrl in constructor options.");
    }
    if (!ip) {
      throw new Error("EposClient requires printer IP in constructor options.");
    }

    // Configurable endpoints
    this.sdkUrl = sdkUrl;
    this.ip = ip;
    this.port = port;

    this.sdkLoaded = false; // Prevent multiple SDK loads
  }

  /**
   * Sets the SDK URL and marks SDK as not loaded
   * @param {string} sdkUrl - New SDK URL
   */
  setSdkUrl(sdkUrl) {
    this.sdkUrl = sdkUrl;
    this.sdkLoaded = false; // force reload if needed
  }

  /**
   * Sets the printer endpoint (IP and port)
   * @param {string} ip - Printer IP address
   * @param {number} [port] - Printer port (optional)
   */
  setEndpoint(ip, port) {
    this.ip = ip;
    if (typeof port === "number") this.port = port;
  }

  /**
   * Gets the current printer endpoint configuration
   * @returns {{ip: string, port: number}} Current endpoint configuration
   */
  getEndpoint() {
    return { ip: this.ip, port: this.port };
  }

  /**
   * Dynamically loads the Epson ePOS SDK JavaScript file.
   * Handles script injection and ensures SDK is ready before proceeding.
   *
   * @returns {Promise<void>} Resolves when SDK is loaded and window.epson is available
   * @throws {Error} If script fails to load or network error occurs
   */
  async loadSdk() {
    if (this.sdkLoaded || (window.epson && window.epson.ePOSDevice)) {
      this.sdkLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${this.sdkUrl}"]`
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          this.sdkLoaded = true;
          resolve();
        });
        existingScript.addEventListener("error", (e) => reject(e));
        return;
      }

      const script = document.createElement("script");
      script.src = this.sdkUrl;
      script.async = true;

      script.onload = () => {
        this.sdkLoaded = true;
        console.log("✅ Epson SDK loaded");
        resolve();
      };

      script.onerror = (e) => {
        console.error("❌ Failed to load Epson SDK", e);
        reject(new Error("Failed to load Epson SDK"));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Establishes network connection to the Epson printer.
   *
   * Behavior:
   * - Reuses existing connection if already connected (no redundant reconnections)
   * - Cleans up stale device references before reconnecting
   * - Loads SDK automatically if not already loaded
   *
   * @param {string} [ipOverride] - Optional IP address to override constructor value
   * @param {number} [portOverride] - Optional port to override constructor value
   * @returns {Promise<void>} Resolves when connected
   * @throws {Error} If SDK fails to load or connection fails
   */
  async connect(ipOverride, portOverride) {
    // Check if already connected
    if (this.isConnected()) {
      console.log("♻️ Already connected, reusing existing connection");
      return;
    }

    // If there's a stale device reference, clean it up first
    if (this.device) {
      console.log("🧹 Cleaning up stale connection before reconnecting...");
      await this.disconnect();
    }

    await this.loadSdk();

    const ip = ipOverride ?? this.ip;
    const port = portOverride ?? this.port;

    if (!ip) {
      throw new Error(
        "Printer IP not provided. Pass in constructor, setEndpoint(), or connect(ip, port)."
      );
    }

    return new Promise((resolve, reject) => {
      if (!window.epson || !window.epson.ePOSDevice) {
        reject(new Error("Epson ePOS SDK not available after load."));
        return;
      }

      this.device = new window.epson.ePOSDevice();

      const handleConnect = (result) => {
        if (result === "OK" || result === "SSL_CONNECT_OK") {
          console.log(`✅ Connected to printer at ${ip}:${port}`);
          resolve();
        } else {
          reject(new Error("Failed to connect: " + result));
        }
      };

      console.log(`🔗 Attempting to connect to printer at ${ip}:${port}`);
      this.device.connect(ip, port, handleConnect, { eposprint: true });
    });
  }

  /**
   * Creates a printer device object for sending print commands.
   *
   * Behavior:
   * - Reuses existing printer object if already created
   * - Must be called after connect()
   *
   * @param {string} [deviceId="local_printer"] - Device identifier
   * @param {*} [deviceType] - Device type (defaults to DEVICE_TYPE_PRINTER)
   * @returns {Promise<Object>} The printer device object
   * @throws {Error} If device not connected or printer creation fails
   */
  async createPrinter(deviceId = "local_printer", deviceType) {
    return new Promise((resolve, reject) => {
      if (!this.device) {
        reject(new Error("Device not connected."));
        return;
      }

      if (this.printer) {
        console.log(
          "♻️ Printer device already created, reusing existing printer object"
        );
        resolve(this.printer);
        return;
      }

      const type =
        deviceType ||
        this.device.DEVICE_TYPE_PRINTER ||
        window.epson.ePOSDevice.DEVICE_TYPE_PRINTER;

      const handleCreate = (devPrinter, result) => {
        if (result === "OK") {
          this.printer = devPrinter;
          console.log(`✅ Printer device created: ${deviceId}`);
          resolve(devPrinter);
        } else {
          reject(new Error("CreateDevice failed: " + result));
        }
      };

      console.log(`🖨️ Attempting to create printer device: ${deviceId}`);
      this.device.createDevice(
        deviceId,
        type,
        { crypto: false, buffer: false },
        handleCreate
      );
    });
  }

  /**
   * Checks if the printer is currently connected.
   *
   * @returns {boolean} true if connected, false otherwise
   */
  isConnected() {
    try {
      return !!(this.device && this.device?.isConnected());
    } catch (err) {
      console.warn("Error checking connection:", err);
      return false;
    }
  }

  /**
   * Disconnects from the printer and cleans up resources.
   * Safely handles cleanup even if device or printer objects are null.
   *
   * @returns {Promise<void>} Resolves when disconnected and cleaned up
   */
  async disconnect() {
    return new Promise((resolve) => {
      if (!this.device) {
        resolve();
        return;
      }

      const cleanup = () => {
        try {
          this.device.disconnect();
          console.log("🔌 Disconnected from ePOS device");
        } catch (err) {
          console.warn("Disconnect error:", err);
        }
        this.device = null;
        this.printer = null;
        resolve();
      };

      const handleDelete = () => {
        console.log("🧹 Printer device deleted successfully");
        cleanup();
      };

      if (this.printer && this.device.deleteDevice) {
        try {
          this.device.deleteDevice(this.printer, handleDelete);
        } catch (err) {
          console.warn("Error deleting printer device:", err);
          cleanup();
        }
      } else {
        cleanup();
      }
    });
  }

  /**
   * Gets the current printer device object.
   *
   * @returns {Object|null} The printer device object, or null if not created
   */
  getPrinter() {
    return this.printer;
  }
}
