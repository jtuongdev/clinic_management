//ClinicManagement.AdminUl › src › Auth › api › TS auth.api.ts › [e]
import { api } from '../../shared/api/axios.api';
import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '../types/type.auth';

export const authApi = {
  login(request: LoginRequest) {
    return api.post<LoginResponse>('/auth/login', request);
  },
  changePassword(request: ChangePasswordRequest) {
    return api.post('/auth/change-password', request);
  }
};
