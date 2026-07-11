import { useCallback, useState } from "react";

import { createPOSId } from "../utils/posIds";

const usePOSNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, tone = "info") => {
    const notification = {
      id: createPOSId("notice"),
      message,
      tone,
      createdAt: new Date().toISOString(),
    };

    setNotifications((current) => [notification, ...current].slice(0, 5));
    return notification;
  }, []);

  const dismissNotification = useCallback((notificationId) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== notificationId),
    );
  }, []);

  return {
    notifications,
    notify,
    dismissNotification,
  };
};

export default usePOSNotifications;
