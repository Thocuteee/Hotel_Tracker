import axiosInstance from '../lib/axios';
import { AuthResponse } from '../types';

export const loginAPI = async (credentials: { email: string; password: string }) => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};