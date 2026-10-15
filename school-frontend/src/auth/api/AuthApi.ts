import axiosClient from './axiosClient';
import type { LoginRequest } from '../dto/LoginRequest';
import type { AuthResponse } from '../dto/AuthResponse';

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};