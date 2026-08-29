export interface LoginRequest {
  username: string;
  password: string;
  coSoId?: number;
  rememberMe?: boolean;
}

export interface UserInfo {
  id: number;
  username: string;
  fullName: string;
  email: string;
  chuyenKhoa: string | null;
  roles: string[];
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface LoginResponse {
  success: boolean;
  data: LoginData;
  message: string;
}