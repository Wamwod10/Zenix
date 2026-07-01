import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { NotificationContext } from "./NotificationContext";
import "./Notification.scss";

const EXIT_DURATION = 360;
const DEFAULT_DURATION = 4000;

const notificationIcons = {
  success: CheckCircle2,
  warning: TriangleAlert,
  info: Info,
  error: CircleAlert,
};

function NotificationContainer({ notification, isVisible, onClose }) {
  if (!notification || typeof document === "undefined") {
    return null;
  }

  const Icon = notificationIcons[notification.type] || CircleAlert;
  const classes = [
    "ui-notification",
    `ui-notification--${notification.type}`,
    isVisible ? "ui-notification--visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className="ui-notification-layer" aria-live="polite">
      <div
        className={classes}
        key={notification.id}
        role={notification.type === "error" ? "alert" : "status"}
      >
        <span className="ui-notification__glow" aria-hidden="true" />

        <span className="ui-notification__icon" aria-hidden="true">
          <Icon size={20} strokeWidth={2.25} />
        </span>

        <p className="ui-notification__message">{notification.message}</p>

        <button
          className="ui-notification__close"
          type="button"
          aria-label="Notificationni yopish"
          onClick={onClose}
        >
          <X size={17} strokeWidth={2.25} />
        </button>
      </div>
    </div>,
    document.body
  );
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const notificationRef = useRef(null);
  const closeTimerRef = useRef(null);
  const swapTimerRef = useRef(null);
  const frameRef = useRef(null);
  const idRef = useRef(0);

  const clearTimers = useCallback(() => {
    window.clearTimeout(closeTimerRef.current);
    window.clearTimeout(swapTimerRef.current);

    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
  }, []);

  const mountNotification = useCallback((nextNotification) => {
    notificationRef.current = nextNotification;
    setNotification(nextNotification);
    setIsVisible(false);

    frameRef.current = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const closeNotification = useCallback(() => {
    clearTimers();
    setIsVisible(false);

    swapTimerRef.current = window.setTimeout(() => {
      notificationRef.current = null;
      setNotification(null);
    }, EXIT_DURATION);
  }, [clearTimers]);

  const showNotification = useCallback(
    ({ message, type = "info", duration = DEFAULT_DURATION }) => {
      if (!message) {
        return;
      }

      const nextNotification = {
        id: `${Date.now()}-${idRef.current + 1}`,
        type,
        message,
        duration,
      };

      idRef.current += 1;
      clearTimers();

      if (notificationRef.current) {
        setIsVisible(false);
        swapTimerRef.current = window.setTimeout(() => {
          mountNotification(nextNotification);
        }, EXIT_DURATION);
        return;
      }

      mountNotification(nextNotification);
    },
    [clearTimers, mountNotification]
  );

  const value = {
    notify: showNotification,
    closeNotification,
    success: (message, options = {}) =>
      showNotification({ ...options, message, type: "success" }),
    warning: (message, options = {}) =>
      showNotification({ ...options, message, type: "warning" }),
    info: (message, options = {}) =>
      showNotification({ ...options, message, type: "info" }),
    error: (message, options = {}) =>
      showNotification({ ...options, message, type: "error" }),
  };

  useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  useEffect(() => {
    window.clearTimeout(closeTimerRef.current);

    if (notification && isVisible) {
      closeTimerRef.current = window.setTimeout(() => {
        closeNotification();
      }, notification.duration);
    }

    return () => window.clearTimeout(closeTimerRef.current);
  }, [closeNotification, isVisible, notification]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notification={notification}
        isVisible={isVisible}
        onClose={closeNotification}
      />
    </NotificationContext.Provider>
  );
}
