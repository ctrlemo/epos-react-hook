# Epson ePOS React Hook

A React hook for managing Epson ePOS thermal printer connections.
In the future this package will include more functionality for printing and support for other ePOS printer brands.

## Installation

```bash
npm install @ctrlemo/epos-react-hook
```

## Usage

First you need to download the Epson ePOS SDK from [Epson's official website](https://support.epson.net/setupnavi/) and host the `epos-sdk.js` file in your public site directory or a CDN. You will also find the API documentation there for your particular printer model.

Then you can use the hook in your React component as follows:

```javascript
import { useEposPrinter, PRINTER_STATUS } from "@ctrlemo/epos-react-hook";

function PrinterComponent() {
  const { printer, status, connect, disconnect, error } = useEposPrinter(
    "192.168.1.100", // printer IP or hostname
    "/path/to/epos-sdk.js", // path to epos-sdk.js
    8043 // port (optional)
  );

  const handleConnect = async () => {
    const printerObj = await connect();
    if (printerObj) {
      console.log("Printer connected!");
    }
  };

  return (
    <div>
      <p>Status: {status}</p>
      {status === PRINTER_STATUS.IDLE && (
        <button onClick={handleConnect}>Connect</button>
      )}
      {status === PRINTER_STATUS.CONNECTED && (
        <button onClick={disconnect}>Disconnect</button>
      )}
    </div>
  );
}
```

## TypeScript Support

This package includes full TypeScript support with comprehensive type definitions. Both JavaScript and TypeScript consumers can use the package seamlessly.

### TypeScript Usage

```typescript
import {
  useEposPrinter,
  EposClient,
  PRINTER_STATUS,
  type PrinterStatus,
  type UseEposPrinterReturn,
  type EposClientOptions,
} from "@ctrlemo/epos-react-hook";

// Hook usage with full type safety
function MyPrinterComponent(): JSX.Element {
  const {
    printer,
    status,
    error,
    connect,
    disconnect,
    isConnected,
  }: UseEposPrinterReturn = useEposPrinter(
    "192.168.1.100", // IP address
    "/epos-sdk.js", // SDK URL
    8043 // Port (optional)
  );

  // Type-safe status handling
  const handleStatusChange = (newStatus: PrinterStatus): void => {
    switch (newStatus) {
      case PRINTER_STATUS.IDLE:
        console.log("Printer is idle");
        break;
      case PRINTER_STATUS.CONNECTING:
        console.log("Connecting...");
        break;
      case PRINTER_STATUS.CONNECTED:
        console.log("Connected");
        break;
      case PRINTER_STATUS.ERROR:
        console.log("Error occurred");
        break;
    }
  };

  const handleConnect = async (): Promise<void> => {
    try {
      const printerInstance = await connect();
      if (printerInstance) {
        console.log("Connected successfully");
      }
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  return (
    <div>
      <p>Status: {status}</p>
      {error && <p>Error: {error}</p>}
      <button onClick={handleConnect} disabled={isConnected()}>
        Connect
      </button>
    </div>
  );
}

// Direct client usage with TypeScript
class TypeSafePrinterService {
  private client: EposClient;

  constructor(config: EposClientOptions) {
    this.client = new EposClient(config);
  }

  async initialize(): Promise<void> {
    await this.client.loadSdk();
  }

  async connect(): Promise<any> {
    await this.client.connect();
    return await this.client.createPrinter();
  }

  isConnected(): boolean {
    return this.client.isConnected();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}
```

### Available Types

- `PrinterStatus`: Union type of all possible printer status values
- `UseEposPrinterReturn`: Interface for the hook's return value
- `EposClientOptions`: Configuration interface for EposClient
- `EposEndpoint`: Interface for printer endpoint information

### Type Validation

The package includes utility functions for runtime type validation:

```typescript
import { isValidPrinterStatus, PRINTER_STATUS } from "@ctrlemo/epos-react-hook";

// Type guard function
function handleUnknownStatus(status: unknown) {
  if (isValidPrinterStatus(status)) {
    // TypeScript now knows status is PrinterStatus
    console.log("Valid status:", status);
  }
}
```

## API Reference

### useEposPrinter Hook

```typescript
function useEposPrinter(
  ip: string,
  sdkUrl: string,
  port?: number
): UseEposPrinterReturn;
```

**Parameters:**

- `ip`: Printer IP address or hostname
- `sdkUrl`: Path to the Epson ePOS SDK JavaScript file
- `port`: Printer port (optional, defaults to 8043)

**Returns:**

- `printer`: The printer instance (null when not connected)
- `status`: Current connection status
- `error`: Error message (null when no error)
- `connect()`: Function to establish connection
- `disconnect()`: Function to close connection
- `isConnected()`: Function to check connection status

### EposClient Class

```typescript
class EposClient {
  constructor(options: EposClientOptions);
  loadSdk(): Promise<void>;
  connect(): Promise<void>;
  createPrinter(): Promise<any>;
  getEndpoint(): EposEndpoint;
  isConnected(): boolean;
  disconnect(): Promise<void>;
}
```

### Constants

```typescript
const PRINTER_STATUS: {
  readonly IDLE: "idle";
  readonly CONNECTING: "connecting";
  readonly CONNECTED: "connected";
  readonly ERROR: "error";
};

const PRINTER_STATUS_LABELS: {
  readonly idle: "Idle";
  readonly connecting: "Connecting...";
  readonly connected: "Connected";
  readonly error: "Error";
};
```
