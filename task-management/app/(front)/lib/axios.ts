import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface ApiErrorBody {
  code: string;
  message: string;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(body: ApiErrorBody, status: number) {
    super(body.message);
    this.code = body.code;
    this.status = status;
  }
}

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<void> | null = null;

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    const requestUrl = config?.url ?? '';
    const isAuthRequest = /\/auth\/(login|logout|refresh)(\?|$)/.test(requestUrl);

    if (error.response?.status !== 401 || !config || config._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      refreshPromise ??= refreshClient
        .post('/auth/refresh')
        .then(() => undefined)
        .finally(() => {
          refreshPromise = null;
        });
      await refreshPromise;
      return axiosInstance(config);
    } catch (refreshError) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
      return Promise.reject(refreshError);
    }
  }
);
