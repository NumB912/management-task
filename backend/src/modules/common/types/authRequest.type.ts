import type { Request } from 'express';

export type AuthUserPayload = { id: string; role: string; email: string };

export type AuthRequest = Request & { user: AuthUserPayload };
