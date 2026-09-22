import { api } from '../../shared/api/axios.api';
import type { LoginRequest, LoginResponse } from '../types/type.auth';

export const authApi = {
  login(request: LoginRequest) {
    return api.post<LoginResponse>('/auth/login', request);
  },
  changePassword(request: { oldPassword: string; newPassword: string }) {
    return api.post('/Auth/change-password', request);
  },
};