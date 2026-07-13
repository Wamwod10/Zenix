import { useEffect } from "react";

const usePOSKeyboard = ({
  enabled = true,
  activeModal = null,
  onDiscount,
  onEscape,
  onConfirm,
  onNewSale,
  onPayment,
  onHoldSale,
  onPriceCheck,
  onCustomer,
  onVoid,
  onReturn,
  onFocusSearch,
  onShortcutFeedback,
} = {}) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (isEditable && event.key !== "F4") {
        return;
      }

      if (event.key === "/" && !activeModal) {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }

      if (event.key === "F2") {
        event.preventDefault();
        onShortcutFeedback?.("F2", "Yangi savdo");
        onNewSale?.();
        return;
      }

      if (event.key === "F3") {
        event.preventDefault();
        onShortcutFeedback?.("F3", "Qidiruv fokuslandi");
        onFocusSearch?.();
        return;
      }

      if (event.key === "F4") {
        event.preventDefault();
        onShortcutFeedback?.("F4", "To'lov oynasi");
        onPayment?.();
        return;
      }

      if (event.key === "F5") {
        event.preventDefault();
        onPriceCheck?.();
        return;
      }

      if (event.key === "F6") {
        event.preventDefault();
        onHoldSale?.();
        return;
      }

      if (event.key === "F7") {
        event.preventDefault();
        onCustomer?.();
        return;
      }

      if (event.key === "F8") {
        event.preventDefault();
        onVoid?.();
        return;
      }

      if (event.key === "F9") {
        event.preventDefault();
        onDiscount?.();
        return;
      }

      if (event.key === "Enter" && activeModal) {
        onConfirm?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeModal,
    enabled,
    onDiscount,
    onEscape,
    onFocusSearch,
    onHoldSale,
    onConfirm,
    onCustomer,
    onNewSale,
    onPayment,
    onPriceCheck,
    onReturn,
    onShortcutFeedback,
    onVoid,
  ]);
};

export default usePOSKeyboard;
