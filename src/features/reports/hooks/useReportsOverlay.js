import { useEffect, useRef } from "react";

export const useReportsOverlay = (open, onClose) => {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    document.body.classList.add("reports-scroll-lock");

    const focusable = () =>
      panelRef.current?.querySelector(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );

    window.requestAnimationFrame(() => focusable()?.focus());

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll(
          "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      );
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("reports-scroll-lock");
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  return panelRef;
};
