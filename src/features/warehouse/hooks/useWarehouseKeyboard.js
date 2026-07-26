import { useEffect } from "react";

const isEditableTarget = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const useWarehouseKeyboard = ({
  activeModal,
  onFocusSearch,
  onOpenReceipt,
  onOpenIssue,
  onOpenTransfer,
  onEscape,
  onShortcutFeedback,
} = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented) return;

      const editable = isEditableTarget(event.target);

      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onShortcutFeedback?.("Ctrl K", "Global warehouse search");
        onFocusSearch?.();
        return;
      }

      if (editable || activeModal) return;

      if (event.key === "F1") {
        event.preventDefault();
        onShortcutFeedback?.("F1", "Qidiruv");
        onFocusSearch?.();
        return;
      }

      if (event.key === "F2") {
        event.preventDefault();
        onShortcutFeedback?.("F2", "Goods receipt");
        onOpenReceipt?.();
        return;
      }

      if (event.key === "F3") {
        event.preventDefault();
        onShortcutFeedback?.("F3", "Goods issue");
        onOpenIssue?.();
        return;
      }

      if (event.key === "F4") {
        event.preventDefault();
        onShortcutFeedback?.("F4", "Transfer");
        onOpenTransfer?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeModal,
    onEscape,
    onFocusSearch,
    onOpenIssue,
    onOpenReceipt,
    onOpenTransfer,
    onShortcutFeedback,
  ]);
};

export default useWarehouseKeyboard;
