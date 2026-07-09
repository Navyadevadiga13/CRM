import axiosClient from "./axiosClient";

export const getStudents = (params?: Record<string, string | number | undefined>) =>
  axiosClient.get("/students/all", { params });

export const searchStudents = (search: string) =>
  axiosClient.get("/students/search", { params: { search } });

export const filterStudents = (params?: Record<string, string | number | undefined>) =>
  axiosClient.get("/students/filter", { params });

export const createStudent = (payload: Record<string, unknown>) =>
  axiosClient.post("/students/create", payload);

export const getStudentById = (id: string) => axiosClient.get(`/students/${id}`);

export const updateStudent = (id: string, payload: Record<string, unknown>) =>
  axiosClient.put(`/students/update/${id}`, payload);

// leadStatus: "Cold" | "Warm" | "Hot" | "Converted" | "Withdrawn"
// Include expectedIntake when moving to "Warm",
// destinationCountry when moving to "Converted",
// withdrawalReason when moving to "Withdrawn".
export const updateLeadStatus = (id: string, payload: Record<string, unknown>) =>
  axiosClient.patch(`/students/status/${id}`, payload);

export const assignPartner = (id: string, partnerId: string) =>
  axiosClient.patch(`/students/assign-partner/${id}`, { partnerId });

export const assignCityHead = (id: string, cityHeadId: string) =>
  axiosClient.patch(`/students/assign-city-head/${id}`, { cityHeadId });

export const updateRemarks = (id: string, remarks: string) =>
  axiosClient.patch(`/students/remarks/${id}`, { remarks });

export const updateFollowUp = (id: string, followUpDate: string) =>
  axiosClient.patch(`/students/followup/${id}`, { followUpDate });

export const toggleStudentStatus = (id: string) =>
  axiosClient.patch(`/students/toggle/${id}`);

export const deleteStudent = (id: string) => axiosClient.delete(`/students/${id}`);