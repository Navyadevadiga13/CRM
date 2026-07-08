import axiosClient from "./axiosClient";

export const getStudents = (params?: Record<string, string | number | undefined>) =>
  axiosClient.get("/students/all", { params });

export const createStudent = (payload: Record<string, unknown>) =>
  axiosClient.post("/students/create", payload);

export const getStudentById = (id: string) => axiosClient.get(`/students/${id}`);

export const updateStudent = (id: string, payload: Record<string, unknown>) =>
  axiosClient.put(`/students/update/${id}`, payload);

export const deleteStudent = (id: string) => axiosClient.delete(`/students/${id}`);
