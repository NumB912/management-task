import { IRole } from "./member.entities";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "ALL";
export type PermissionMethodMap = Partial<Record<IRole, HttpMethod[]>>;