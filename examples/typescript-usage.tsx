/**
 * TypeScript Usage Examples for @ctrlemo/epos-react-hook
 *
 * This file demonstrates how to use the package with full TypeScript support,
 * including type safety, IntelliSense, and proper error handling.
 *
 * Note: This is a demonstration file. In a real project, you would install
 * the package and import from '@ctrlemo/epos-react-hook'.
 */

import {
  useEposPrinter,
  EposClient,
  PRINTER_STATUS,
  type PrinterStatus,
  type UseEposPrinterReturn,
  type EposClientOptions,
} from "@ctrlemo/epos-react-hook";

// Example 1: Using the React Hook with TypeScript
function demonstrateHookUsage() {
  // In a React component, you would use the hook like this:
  const hookResult: UseEposPrinterReturn = useEposPrinter(
    "192.168.1.100", // IP address (type: string)
    "/epos-sdk.js", // SDK URL (type: string)
    8043 // Port (type: number, optional)
  );

  // Destructure with full type safety
  const {
    printer, // type: any | null
    status, // type: PrinterStatus
    error, // type: string | null
    connect, // type: () => Promise<any | null>
    disconnect, // type: () => Promise<void>
    isConnected, // type: () => boolean
  } = hookResult;

  // TypeScript provides IntelliSense for status values
  function handleStatusChange(newStatus: PrinterStatus): void {
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
        // TypeScript will catch if we miss any status values
        console.warn("Unknown status:", newStatus);
    }
  }

  // Async functions with proper error handling
  async function connectToPrinter(): Promise<void> {
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

  async function disconnectFromPrinter(): Promise<void> {
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

// Example 2: Using EposClient Directly with TypeScript
class TypeSafePrinterService {
  private client: EposClient;
  private connectionStatus: PrinterStatus = PRINTER_STATUS.IDLE;

  constructor(config: EposClientOptions) {
    // TypeScript ensures all required properties are provided
    this.client = new EposClient(config);
  }

  // Get current status with type safety
  getStatus(): PrinterStatus {
    return this.connectionStatus;
  }

  // Initialize SDK with proper error handling
  async initialize(): Promise<void> {
    try {
      this.connectionStatus = PRINTER_STATUS.CONNECTING;
      await this.client.loadSdk();
      console.log("SDK loaded successfully");
    } catch (error: unknown) {
      this.connectionStatus = PRINTER_STATUS.ERROR;
      if (error instanceof Error) {
        throw new Error(`SDK initialization failed: ${error.message}`);
      } else {
        throw new Error("SDK initialization failed: Unknown error");
      }
    }
  }

  // Connect with type-safe return value
  async connect(): Promise<any> {
    try {
      this.connectionStatus = PRINTER_STATUS.CONNECTING;
      await this.client.connect();
      const printer = await this.client.createPrinter();
      this.connectionStatus = PRINTER_STATUS.CONNECTED;
      return printer;
    } catch (error: unknown) {
      this.connectionStatus = PRINTER_STATUS.ERROR;
      throw error;
    }
  }

  // Type-safe getter methods
  getEndpoint() {
    return this.client.getEndpoint();
  }

  isConnected(): boolean {
    return this.client.isConnected();
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.connectionStatus = PRINTER_STATUS.IDLE;
    } catch (error: unknown) {
      this.connectionStatus = PRINTER_STATUS.ERROR;
      throw error;
    }
  }
}

// Example 3: Type-Safe Configuration and Factory Pattern
// Factory function with full type safety
function createPrinterService(
  config: EposClientOptions
): TypeSafePrinterService {
  return new TypeSafePrinterService(config);
}

// Example 4: Usage with Full Type Validation
async function demonstrateFullTypeScript(): Promise<void> {
  // Configuration with type checking
  const printerConfig: EposClientOptions = {
    ip: "192.168.1.100",
    port: 8043,
    sdkUrl: "/assets/epos-2.20.0.js",
  };

  // Create service with type safety
  const printerService = createPrinterService(printerConfig);

  try {
    // Initialize and connect with proper error handling
    await printerService.initialize();
    console.log("Service initialized");

    const printer = await printerService.connect();
    console.log("Connected to printer:", printer);

    // Check status with type safety
    const status: PrinterStatus = printerService.getStatus();
    console.log("Current status:", status);

    // Get endpoint info
    const endpoint = printerService.getEndpoint();
    console.log("Endpoint:", endpoint);

    // Disconnect when done
    await printerService.disconnect();
    console.log("Disconnected successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Printer service error:", error.message);
    } else {
      console.error("Unknown error occurred:", error);
    }
  }
}

// Export types and classes for use in other files
export {
  TypeSafePrinterService,
  createPrinterService,
  demonstrateHookUsage,
  demonstrateFullTypeScript,
};

export type { PrinterStatus, UseEposPrinterReturn, EposClientOptions };
