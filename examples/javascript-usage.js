/**
 * JavaScript Usage Examples for @ctrlemo/epos-react-hook
 *
 * This file demonstrates how to use the package in regular JavaScript,
 * showing that TypeScript consumers get additional type safety while
 * JavaScript consumers can use the package normally.
 */

import {
  useEposPrinter,
  EposClient,
  PRINTER_STATUS,
} from "@ctrlemo/epos-react-hook";

// Example 1: Using the React Hook in JavaScript
function demonstrateHookUsage() {
  // In a React component, you would use the hook like this:
  const { printer, status, error, connect, disconnect, isConnected } =
    useEposPrinter(
      "192.168.1.100", // IP address
      "/epos-sdk.js", // SDK URL
      8043 // Port (optional)
    );

  // Handle status changes
  function handleStatusChange(newStatus) {
    switch (newStatus) {
      case PRINTER_STATUS.IDLE:
        console.log("Printer is idle and ready");
        break;
      case PRINTER_STATUS.CONNECTING:
        console.log("Attempting to connect to printer...");
        break;
      case PRINTER_STATUS.CONNECTED:
        console.log("Successfully connected to printer");
        break;
      case PRINTER_STATUS.ERROR:
        console.log("An error occurred with the printer connection");
        break;
      default:
        console.warn("Unknown status:", newStatus);
    }
  }

  // Async connection handling
  async function connectToPrinter() {
    try {
      const printerInstance = await connect();
      if (printerInstance) {
        console.log(
          "Connection successful! Printer instance:",
          printerInstance
        );
      } else {
        console.log("Connection returned null");
      }
    } catch (err) {
      console.error("Failed to connect to printer:", err);
    }
  }

  async function disconnectFromPrinter() {
    try {
      await disconnect();
      console.log("Successfully disconnected from printer");
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  }

  // Example usage
  handleStatusChange(status);
  console.log("Current connection state:", isConnected());

  if (error) {
    console.error("Current error:", error);
  }
}

// Example 2: Using EposClient Directly in JavaScript
class PrinterService {
  constructor(config) {
    this.client = new EposClient(config);
    this.connectionStatus = PRINTER_STATUS.IDLE;
  }

  getStatus() {
    return this.connectionStatus;
  }

  async initialize() {
    try {
      this.connectionStatus = PRINTER_STATUS.CONNECTING;
      await this.client.loadSdk();
      console.log("SDK loaded successfully");
    } catch (error) {
      this.connectionStatus = PRINTER_STATUS.ERROR;
      throw new Error(`SDK initialization failed: ${error.message}`);
    }
  }

  async connect() {
    try {
      this.connectionStatus = PRINTER_STATUS.CONNECTING;
      await this.client.connect();
      const printer = await this.client.createPrinter();
      this.connectionStatus = PRINTER_STATUS.CONNECTED;
      return printer;
    } catch (error) {
      this.connectionStatus = PRINTER_STATUS.ERROR;
      throw error;
    }
  }

  getEndpoint() {
    return this.client.getEndpoint();
  }

  isConnected() {
    return this.client.isConnected();
  }

  async disconnect() {
    try {
      await this.client.disconnect();
      this.connectionStatus = PRINTER_STATUS.IDLE;
    } catch (error) {
      this.connectionStatus = PRINTER_STATUS.ERROR;
      throw error;
    }
  }
}

// Example 3: Factory Pattern in JavaScript
function createPrinterService(config) {
  const clientConfig = {
    sdkUrl: config.sdkUrl,
    ip: config.ip,
    port: config.port || 8043, // Default port
  };

  return new PrinterService(clientConfig);
}

// Example 4: Complete Usage Example
async function demonstrateFullUsage() {
  // Configuration object
  const printerConfig = {
    ip: "192.168.1.100",
    port: 8043,
    sdkUrl: "/assets/epos-2.20.0.js",
  };

  // Create service
  const printerService = createPrinterService(printerConfig);

  try {
    // Initialize and connect
    await printerService.initialize();
    console.log("Service initialized");

    const printer = await printerService.connect();
    console.log("Connected to printer:", printer);

    // Check status
    const status = printerService.getStatus();
    console.log("Current status:", status);

    // Get endpoint info
    const endpoint = printerService.getEndpoint();
    console.log("Endpoint:", endpoint);

    // Disconnect when done
    await printerService.disconnect();
    console.log("Disconnected successfully");
  } catch (error) {
    console.error("Printer service error:", error.message);
  }
}

// Example 5: React Component Usage (JavaScript)
function MyPrinterComponent() {
  const { printer, status, error, connect, disconnect, isConnected } =
    useEposPrinter("192.168.1.100", "/epos-sdk.js", 8043);

  const handleConnect = async () => {
    try {
      await connect();
      console.log("Connected successfully");
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      console.log("Disconnected successfully");
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

  // In a real React component, you would return JSX here
  // This is just to show the logic structure
  console.log("Component state:", {
    status,
    error,
    connected: isConnected(),
    hasPrinter: !!printer,
  });

  return {
    status,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
    isConnected: isConnected(),
  };
}

// Export for use in other files
export {
  PrinterService,
  createPrinterService,
  demonstrateHookUsage,
  demonstrateFullUsage,
  MyPrinterComponent,
};
