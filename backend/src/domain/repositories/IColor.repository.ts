import { IColor, ITypeColor } from "../entities/color.entity.js";
import { IRepository } from "./IRepository.js";

export interface IColorRepository extends IRepository<IColor> {
  findByRef(
    DTO: { type: ITypeColor; refId: string; user: string },
    session?: unknown
  ): Promise<IColor | null>;
  findManyByRefIds(
    DTO: { type: ITypeColor; refIds: string[]; user: string },
    session?: unknown
  ): Promise<IColor[]>;
  deleteByRef(
    DTO: { type: ITypeColor; refId: string; user: string },
    session?: unknown
  ): Promise<boolean>;
  deleteManyByRefIds(
    DTO: { type: ITypeColor; refIds: string[] },
    session?: unknown
  ): Promise<boolean>;
}
