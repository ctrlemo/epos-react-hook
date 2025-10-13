/**
 * TypeScript Type Validation Test
 *
 * This file validates that the TypeScript declarations are working correctly.
 * It won't be run as a test but serves as a compilation check.
 */

import {
  useEposPrinter,
  EposClient,
  PRINTER_STATUS,
  PRINTER_STATUS_LABELS,
  type PrinterStatus,
  type UseEposPrinterReturn,
  type EposClientOptions,
  type EposEndpoint,
  isValidPrinterStatus,
} from "@ctrlemo/epos-react-hook";

// Test constant types
const status1: PrinterStatus = PRINTER_STATUS.IDLE;
const status2: PrinterStatus = PRINTER_STATUS.CONNECTING;
const status3: PrinterStatus = PRINTER_STATUS.CONNECTED;
const status4: PrinterStatus = PRINTER_STATUS.ERROR;

// Test labels
const label1: string = PRINTER_STATUS_LABELS.idle;
const label2: string = PRINTER_STATUS_LABELS.connecting;
const label3: string = PRINTER_STATUS_LABELS.connected;
const label4: string = PRINTER_STATUS_LABELS.error;

// Test EposClientOptions interface
const validConfig: EposClientOptions = {
  sdkUrl: "/epos-sdk.js",
  ip: "192.168.1.100",
  port: 8043, // optional
};

const minimalConfig: EposClientOptions = {
  sdkUrl: "/epos-sdk.js",
  ip: "192.168.1.100",
  // port is optional
};

// Test EposClient class
const client = new EposClient(validConfig);

// Test that methods exist and have correct return types
async function testClient(): Promise<void> {
  await client.loadSdk(); // Returns Promise<void>
  await client.connect(); // Returns Promise<void>
  const printer = await client.createPrinter(); // Returns Promise<any>
  const endpoint: EposEndpoint = client.getEndpoint(); // Returns EposEndpoint
  const connected: boolean = client.isConnected(); // Returns boolean
  await client.disconnect(); // Returns Promise<void>
}

// Test hook return type
function testHook(): void {
  const hookResult: UseEposPrinterReturn = useEposPrinter(
    "192.168.1.100",
    "/epos-sdk.js",
    8043
  );

  // Test destructuring with correct types
  const {
    printer, // any | null
    status, // PrinterStatus
    error, // string | null
    connect, // () => Promise<any | null>
    disconnect, // () => Promise<void>
    isConnected, // () => boolean
  } = hookResult;

  // Test method calls
  async function testMethods(): Promise<void> {
    const printerInstance = await connect(); // Returns Promise<any | null>
    await disconnect(); // Returns Promise<void>
    const connectionStatus = isConnected(); // Returns boolean
  }
}

// Test utility function
function testUtility(): void {
  const valid1: boolean = isValidPrinterStatus(PRINTER_STATUS.IDLE);
  const valid2: boolean = isValidPrinterStatus("invalid");
  const valid3: boolean = isValidPrinterStatus(null);
}

// Test type guards and type narrowing
function testTypeGuards(unknownStatus: unknown): void {
  if (isValidPrinterStatus(unknownStatus)) {
    // TypeScript should narrow the type here
    const validStatus: PrinterStatus = unknownStatus;
    console.log("Valid status:", validStatus);
  }
}

// Test that invalid assignments are caught (these should cause TypeScript errors)
// Uncomment these to test that TypeScript catches invalid usage:

// const invalidStatus: PrinterStatus = 'invalid';  // Should error
// const invalidConfig: EposClientOptions = { sdkUrl: '/sdk.js' };  // Should error (missing ip)
// const hookWithWrongArgs = useEposPrinter();  // Should error (missing required args)

export {}; // Make this a module
