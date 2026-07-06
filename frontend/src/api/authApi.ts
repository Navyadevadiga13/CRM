import axiosClient from "./axiosClient";

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    region?: string;
    cities?: string[];
  };
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axiosClient.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};