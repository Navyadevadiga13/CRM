import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationApi";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await getNotifications();

      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  // Load notifications immediately
  refreshNotifications();

  // Refresh every 20 seconds
  const interval = setInterval(() => {
    refreshNotifications();
  }, 20000);

  // Cleanup when component unmounts
  return () => clearInterval(interval);
}, [refreshNotifications]);

  const markAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = async () => {
    await markAllNotificationsAsRead();
    refreshNotifications();
  };

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };
};