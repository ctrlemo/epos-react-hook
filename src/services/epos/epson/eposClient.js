// eposClient.js

/**
 * EposClient - A wrapper around Epson's ePOS SDK for thermal printer communication
 *
 * Lifecycle:
 * 1. Dynamically loads the Epson SDK script
 * 2. Establishes network connection to printer
 * 3. Creates printer device objects for actual printing
 * 4. Handles cleanup and disconnection
 */
export default class EposClient {
  /**
   * @param {Object} options
   * @param {string} options.sdkUrl - URL to Epson ePOS SDK
   * @param {string} options.ip - Default printer IP or hostname
   * @param {number} [options.port=8043] - Default printer port
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
   * Update SDK script URL at runtime.
   * @param {string} sdkUrl
   */
  setSdkUrl(sdkUrl) {
    this.sdkUrl = sdkUrl;
    this.sdkLoaded = false; // force reload if needed
  }

  /**
   * Update printer endpoint at runtime.
   * @param {string} ip
   * @param {number} [port]
   */
  setEndpoint(ip, port) {
    this.ip = ip;
    if (typeof port === "number") this.port = port;
  }

  /**
   * @returns {{ip:string|null, port:number}} current endpoint
   */
  getEndpoint() {
    return { ip: this.ip, port: this.port };
  }

  /**
   * Dynamically loads the Epson ePOS SDK JavaScript file
   *
   * Promise Resolution: SDK is loaded and window.epson is available
   * Promise Rejection: Script failed to load or network error
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
   * Establishes network connection to the Epson printer
   *
   * @param {string} [ipOverride] - Optional override IP
   * @param {number} [portOverride] - Optional override Port
   */
  async connect(ipOverride, portOverride) {
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
   * Creates a printer device object for sending print commands
   *
   * @param {string} [deviceId="local_printer"]
   * @param {*} [deviceType]
   */
  async createPrinter(deviceId = "local_printer", deviceType) {
    return new Promise((resolve, reject) => {
      if (!this.device) {
        reject(new Error("Device not connected."));
        return;
      }

      const type =
        deviceType ||
        this.device.DEVICE_TYPE_PRINTER ||
        window.epson.ePOSDevice.DEVICE_TYPE_PRINTER;

      const handleCreate = (dev, result) => {
        if (result === "OK") {
          this.printer = dev;
          console.log(`✅ Printer device created: ${deviceId}`);
          resolve(dev);
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
   * Synchronous check if device is connected
   */
  isConnected() {
    try {
      return this.device ? this.device.isConnected() : false;
    } catch (err) {
      console.warn("Error checking connection:", err);
      return false;
    }
  }

  /**
   * Properly disconnects from printer and cleans up resources
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
   * Get the current printer device object
   */
  getPrinter() {
    return this.printer;
  }
}
