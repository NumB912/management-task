export type ITypeColor = "list" | "task";
export interface IColorModel {
  id: string;
  color: string;
  type: ITypeColor;
  refId: string;
  user: string;
  path: string;
}
