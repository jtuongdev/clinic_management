import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.info('[API] Request', {
        method: config.method?.toUpperCase(),
        url: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
        hasAuth: Boolean(token),
        params: config.params,
      });
      if (!token) {
        console.warn('[API] Request không có accessToken', config.url);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.info('[API] Response', {
        method: response.config.method?.toUpperCase(),
        url: response.config.baseURL
          ? `${response.config.baseURL}${response.config.url}`
          : response.config.url,
        status: response.status,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (import.meta.env.DEV) {
      console.error('[API] Request failed', {
        method: originalRequest?.method?.toUpperCase(),
        url: originalRequest?.baseURL
          ? `${originalRequest.baseURL}${originalRequest.url}`
          : originalRequest?.url,
        status: status ?? 'NETWORK_ERROR',
        hasAuth: Boolean(originalRequest?.headers?.Authorization),
        message: error.response?.data?.message ?? error.message,
      });
    }

    // Tự động Refresh Token khi gặp mã lỗi 401 Unauthorized
    if (status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url ?? '';
      if (url.includes('/auth/login') || url.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post('/api/auth/refresh-token', { refreshToken });
        const data = res.data?.data;
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Không nhận được access token mới');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
