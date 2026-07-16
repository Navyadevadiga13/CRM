import axiosClient from "./axiosClient";

export const getNotifications = () =>
  axiosClient.get("/notifications");

export const markNotificationAsRead = (id: string) =>
  axiosClient.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  axiosClient.patch("/notifications/read-all");