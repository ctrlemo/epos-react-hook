// TypeScript declarations for @ctrlemo/epos-react-hook

// Printer Status Constants
export declare const PRINTER_STATUS: {
  readonly IDLE: "idle";
  readonly CONNECTING: "connecting";
  readonly CONNECTED: "connected";
  readonly ERROR: "error";
};

export declare const PRINTER_STATUS_LABELS: {
  readonly idle: "Idle";
  readonly connecting: "Connecting...";
  readonly connected: "Connected";
  readonly error: "Error";
};

export type PrinterStatus =
  (typeof PRINTER_STATUS)[keyof typeof PRINTER_STATUS];

// EposClient Configuration Types
export interface EposClientOptions {
  sdkUrl: string;
  ip: string;
  port?: number;
}

export interface EposEndpoint {
  ip: string;
  port: number;
}

// Epson Printer Device Interface (returned from connect/createPrinter)
export interface EposPrinterDevice {
  addText(text: string): void;
  addCut(type?: number): void;
  addFeedLine(lines: number): void;
  send(callback?: (result: any) => void): void;
  startMonitor?(): void;
  stopMonitor?(): void;
  onreceive?: (response: any) => void;
  onstatuschange?: (status: any) => void;
  onerror?: (error: any) => void;
  [key: string]: any;
}

// EposClient Class
export declare class EposClient {
  sdkUrl: string;
  ip: string;
  port: number;
  device: any;
  printer: EposPrinterDevice | null;
  sdkLoaded: boolean;

  constructor(options: EposClientOptions);

  /**
   * Sets the SDK URL
   */
  setSdkUrl(sdkUrl: string): void;

  /**
   * Sets the printer endpoint
   */
  setEndpoint(ip: string, port?: number): void;

  /**
   * Gets the current printer endpoint
   */
  getEndpoint(): EposEndpoint;

  /**
   * Loads the Epson ePOS SDK
   */
  loadSdk(): Promise<void>;

  /**
   * Connects to the printer.
   * Reuses existing connection if already connected.
   * Cleans up stale connections before reconnecting.
   */
  connect(ipOverride?: string, portOverride?: number): Promise<void>;

  /**
   * Creates a printer device object.
   * Reuses existing printer if already created.
   */
  createPrinter(
    deviceId?: string,
    deviceType?: any
  ): Promise<EposPrinterDevice>;

  /**
   * Checks if currently connected to printer
   */
  isConnected(): boolean;

  /**
   * Disconnects from the printer
   */
  disconnect(): Promise<void>;

  /**
   * Gets the current printer device object
   */
  getPrinter(): EposPrinterDevice | null;
}

// Hook Return Type
export interface UseEposPrinterReturn {
  /** The printer device object */
  printer: EposPrinterDevice | null;
  /** Current printer connection status */
  status: PrinterStatus;
  /** Last error encountered, if any */
  error: string | null;
  /** Connects to the printer (reuses existing connection) */
  connect: () => Promise<EposPrinterDevice | null>;
  /** Disconnects from the printer */
  disconnect: () => Promise<void>;
  /** Function to check if currently connected to printer */
  isConnected: () => boolean;
}

/**
 * React hook for managing Epson ePOS printer connections and operations
 * @param ip - The IP address or hostname of the Epson printer
 * @param sdkUrl - URL path to the Epson ePOS SDK JavaScript file
 * @param port - The port number for the printer connection (default: 8043)
 */
export declare function useEposPrinter(
  ip: string,
  sdkUrl: string,
  port?: number
): UseEposPrinterReturn;

// Utility Functions
export declare function isValidPrinterStatus(
  status: any
): status is PrinterStatus;

// Default Export (for compatibility)
declare const _default: {
  useEposPrinter: typeof useEposPrinter;
  EposClient: typeof EposClient;
  PRINTER_STATUS: typeof PRINTER_STATUS;
  PRINTER_STATUS_LABELS: typeof PRINTER_STATUS_LABELS;
  isValidPrinterStatus: typeof isValidPrinterStatus;
};

export default _default;
