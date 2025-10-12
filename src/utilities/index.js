import { PRINTER_STATUS } from "../constants";
/**
 * Type guard to check if a value is a valid printer status
 */
export const isValidPrinterStatus = (status) => {
  return Object.values(PRINTER_STATUS).includes(status);
};
