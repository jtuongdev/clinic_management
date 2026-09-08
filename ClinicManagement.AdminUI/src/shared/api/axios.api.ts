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
  (error) => {
    if (import.meta.env.DEV) {
      const status = error.response?.status;
      console.error('[API] Request failed', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.baseURL
          ? `${error.config.baseURL}${error.config.url}`
          : error.config?.url,
        status: status ?? 'NETWORK_ERROR',
        hasAuth: Boolean(error.config?.headers?.Authorization),
        message: error.response?.data?.message ?? error.message,
      });

      if (status === 401 || status === 403) {
        console.warn('[API] Authentication/authorization failed', {
          status,
          hasAccessToken: Boolean(localStorage.getItem('accessToken')),
        });
      } else if (status === 404) {
        console.warn('[API] Route không tồn tại hoặc proxy/backend chưa expose route này');
      }
    }
    return Promise.reject(error);
  }
);
