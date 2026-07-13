import axiosClient from "./axiosClient";

export const getLeadActivities = (studentId: string) => {
  return axiosClient.get(`/activities/${studentId}`);
};