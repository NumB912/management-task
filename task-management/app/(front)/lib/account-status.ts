import axios from 'axios';

export function isAccountBlockedError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 403) return false;
  const body = error.response.data;
  return body?.code === 'ACCOUNT_BLOCKED' || body?.message === 'Tài khoản đã bị khóa';
}
