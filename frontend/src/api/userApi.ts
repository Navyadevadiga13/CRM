import axiosClient from "./axiosClient";

export const getUsers = (params?: Record<string, string | number | undefined>) =>
  axiosClient.get("/users/all", { params });

export const createUser = (payload: Record<string, unknown>) =>
  axiosClient.post("/users/create", payload);

export const getUserById = (id: string) => axiosClient.get(`/users/${id}`);

export const updateUser = (id: string, payload: Record<string, unknown>) =>
  axiosClient.put(`/users/update/${id}`, payload);

export const toggleUserStatus = (id: string) => axiosClient.patch(`/users/status/${id}`);

export const deleteUser = (id: string) => axiosClient.delete(`/users/${id}`);
