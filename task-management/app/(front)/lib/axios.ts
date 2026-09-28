import axios from 'axios';

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

axiosInstance.interceptors.response.use(
  (res:any) => res,
  (error:any) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);