import axios from "axios";

const API = "http://localhost:3000/api/users";

function getHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export type UserProfileResponse = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: "REQUESTER" | "STOREKEEPER" | "MANAGER";
};

export type UpdateProfileRequest = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export const getProfile = () => {
  return axios.get<UserProfileResponse>(`${API}/me/profile`, {
    headers: getHeaders(),
  });
};

export const updateProfile = (data: UpdateProfileRequest) => {
  return axios.put<UserProfileResponse>(`${API}/me/profile`, data, {
    headers: getHeaders(),
  });
};

export const changePassword = (currentPassword: string, newPassword: string) => {
  return axios.put(
    `${API}/me/change-password`,
    { currentPassword, newPassword },
    { headers: getHeaders() },
  );
};
