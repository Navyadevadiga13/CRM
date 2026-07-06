import axiosClient from "./axiosClient";

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  region: string;
  cities: string[];
}

export const getUsers = async () => {
  const response = await axiosClient.get("/users/all");
  return response.data;
};

export const getUser = async (id: string) => {
  const response = await axiosClient.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (
  data: CreateUserPayload
) => {
  const response = await axiosClient.post(
    "/users/create",
    data
  );

  return response.data;
};

export const updateUser = async (
  id: string,
  data: any
) => {
  const response = await axiosClient.put(
    `/users/update/${id}`,
    data
  );

  return response.data;
};

export const toggleUserStatus = async (
  id: string
) => {
  const response = await axiosClient.patch(
    `/users/status/${id}`
  );

  return response.data;
};

export const deleteUser = async (
  id: string
) => {
  const response = await axiosClient.delete(
    `/users/${id}`
  );

  return response.data;
};