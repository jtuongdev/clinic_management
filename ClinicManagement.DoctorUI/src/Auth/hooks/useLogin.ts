import { useState } from 'react';

import { authApi } from '../api/auth.api';

import { useAuth } from '../context/AuthProvider';

import type { LoginRequest } from '../types/type.auth';

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const { login: authLogin } = useAuth();

  const login = async (request: LoginRequest) => {
    setLoading(true);

    try {
      const response = await authApi.login(request);

      const result = response.data;

      if (result.success) {
        authLogin(
          result.data.accessToken,
          result.data.refreshToken,
          result.data.user
        );
      }

      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
  };
}