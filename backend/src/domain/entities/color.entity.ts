export type ITypeColor = "list" | "task";

/**
 * Màu để gán - màu được gán cho một list hoặc task cụ thể
 */
export interface IColor {
  id: string;
  color: string;
  type: ITypeColor;
  refId: string;
  user: string;
  path: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

/**
 * Màu dùng chung - palette màu chung của user, không gắn vào entity cụ thể
 */
export interface IColorCommon {
  id: string;
  color: string;
  name?: string;
  user: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
