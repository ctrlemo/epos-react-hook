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

// EposClient Types
export interface EposClientOptions {
  sdkUrl: string;
  ip: string;
  port?: number;
}

export interface EposEndpoint {
  ip: string;
  port: number;
}

export declare class EposClient {
  sdkUrl: string;
  ip: string;
  port: number;
  device: any;
  printer: any;
  sdkLoaded: boolean;

  constructor(options: EposClientOptions);

  setSdkUrl(sdkUrl: string): void;
  setEndpoint(ip: string, port?: number): void;
  getEndpoint(): EposEndpoint;

  loadSdk(): Promise<void>;
  connect(): Promise<any>;
  createPrinter(): Promise<any>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  private initializeDevice(): void;
  private setupEventHandlers(): void;
}

// Hook Types
export interface UseEposPrinterReturn {
  printer: any | null;
  status: PrinterStatus;
  error: string | null;
  connect: () => Promise<any | null>;
  disconnect: () => Promise<void>;
  isConnected: () => boolean;
}

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
