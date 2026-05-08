import axios from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth";
import { API_BASE_URL } from "../constants/api";

const API_URL = `${API_BASE_URL}/auth`;

// =============================
// LOGIN
// =============================
export const login = async (data: LoginRequest) => {
  return axios.post<AuthResponse>(`${API_URL}/login`, data);
};

// =============================
// REGISTER
// =============================
export const register = async (data: RegisterRequest) => {
  return axios.post<AuthResponse>(`${API_URL}/register`, data);
};

export const forgotPassword = async (email: string) => {
  return axios.post(`${API_URL}/forgot-password`, { email });
};

export const resetPassword = async (token: string, password: string) => {
  return axios.post(`${API_URL}/reset-password`, { token, password });
};

// =============================
// GET CURRENT USER (JWT)
// =============================
export const getMe = async (token: string) => {
  return axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
