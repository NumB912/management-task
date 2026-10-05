import { IRoleMember } from "./member.entity.js";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "ALL";
export type PermissionMethodMap = Partial<Record<IRoleMember, HttpMethod[]>>;