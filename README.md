# Epson ePOS React Hook

A React hook for managing Epson ePOS thermal printer connections.
In the future this package will include more functionality for printing and support for other ePOS printer brands.

## Installation

```bash
npm install @ctrlemo/epos-react-hook
```

## Usage

First you need to download the Epson ePOS SDK from [Epson's official website](https://support.epson.net/setupnavi/){:target="\_blank"} and host the `epos-sdk.js` file in your public site directory or a CDN. You will also find the API documentation there for your particular printer model.

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
