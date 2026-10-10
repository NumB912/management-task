import { BaseRepository } from "./base.repository.js";
import { IColor, ITypeColor } from "@/domain/entities/color.entity.js";
import { IColorRepository } from "@/domain/repositories/IColor.repository.js";
import { DatabaseModels } from "./database/clientSchema.database.js";
import { ColorMapper } from "../mapper/color.mapper.js";
import { IColorDocument } from "./database/schema/color.schema.js";
import { ClientSession, Types } from "mongoose";
import { Inject, Injectable } from "@nestjs/common";
import { TYPES } from "../types/dependency.type.js";

@Injectable()
export class ColorRepository
  extends BaseRepository<IColorDocument, IColor>
  implements IColorRepository
{
  protected toDomain(doc: IColorDocument): IColor {
    return this.colorMapper.toDomain(doc);
  }
  protected toDomainPartial(
    doc: Partial<IColorDocument>
  ): Partial<IColor> {
    return this.colorMapper.toDomainPartial(doc);
  }
  protected toPresistence(
    doc: Partial<IColor>
  ): Partial<IColorDocument> {
    return this.colorMapper.toPersistencePartial(doc);
  }
  protected toPresistencePartial(
    doc: Partial<IColor>
  ): Partial<IColorDocument> {
    return this.colorMapper.toPersistencePartial(doc);
  }

  constructor(
    @Inject(TYPES.DatabaseType)
    private readonly db: DatabaseModels,
    @Inject(TYPES.ColorMapper)
    private readonly colorMapper: ColorMapper
  ) {
    super(db.Color);
  }

  async findByRef(
    DTO: { type: ITypeColor; refId: string; user: string },
    session?: ClientSession
  ): Promise<IColor | null> {
    const { type, refId, user } = DTO;
    const doc = await this.db.Color.findOne({
      type,
      refId: new Types.ObjectId(refId),
      user: new Types.ObjectId(user),
      deleted_at: null,
    }).session(session ?? null);

    if (!doc) return null;
    return this.colorMapper.toDomain(doc);
  }

  async findManyByRefIds(
    DTO: { type: ITypeColor; refIds: string[]; user: string },
    session?: ClientSession
  ): Promise<IColor[]> {
    const { type, refIds, user } = DTO;
    const docs = await this.db.Color.find({
      type,
      refId: { $in: refIds.map((id) => new Types.ObjectId(id)) },
      user: new Types.ObjectId(user),
      deleted_at: null,
    }).session(session ?? null);

    return docs.map((doc) => this.colorMapper.toDomain(doc));
  }

  async deleteByRef(
    DTO: { type: ITypeColor; refId: string; user: string },
    session?: ClientSession
  ): Promise<boolean> {
    const { type, refId, user } = DTO;
    const result = await this.db.Color.deleteOne({
      type,
      refId: new Types.ObjectId(refId),
      user: new Types.ObjectId(user),
    }).session(session ?? null);

    return result.deletedCount > 0;
  }

  async deleteManyByRefIds(
    DTO: { type: ITypeColor; refIds: string[] },
    session?: ClientSession
  ): Promise<boolean> {
    const { type, refIds } = DTO;
    const result = await this.db.Color.deleteMany({
      type,
      refId: { $in: refIds.map((id) => new Types.ObjectId(id)) },
    }).session(session ?? null);

    return result.deletedCount > 0;
  }
}
