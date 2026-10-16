export type ITypeColor = "list" | "task";
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
