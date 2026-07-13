import { useEffect, useRef } from "react";

const SCAN_RESET_DELAY = 80;

const useBarcodeScanner = ({
  enabled = true,
  minLength = 6,
  products = [],
  onScan,
  onMiss,
} = {}) => {
  const bufferRef = useRef("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const clearBuffer = () => {
      bufferRef.current = "";
      timerRef.current = null;
    };

    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (isEditable) {
        return;
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      if (event.key === "Enter") {
        const barcode = bufferRef.current;
        clearBuffer();

        if (barcode.length >= minLength) {
          const product = products.find(
            (item) => item.barcode === barcode || item.sku === barcode,
          );

          if (product) {
            onScan?.(barcode, product);
          } else {
            onMiss?.(barcode);
          }
        }

        return;
      }

      if (event.key.length === 1) {
        bufferRef.current += event.key;
        timerRef.current = window.setTimeout(clearBuffer, SCAN_RESET_DELAY);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [enabled, minLength, onMiss, onScan, products]);
};

export default useBarcodeScanner;
