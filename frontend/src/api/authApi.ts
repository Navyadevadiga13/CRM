import axiosClient from "./axiosClient";

export const login = (payload: { email: string; password: string }) =>
  axiosClient.post("/auth/login", payload);
