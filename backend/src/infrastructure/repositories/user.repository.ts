import { BaseRepository } from "./base.repository.js"
import { IUserDocument } from "./database/schema/user.schema.js"
import { IUser, IUserWithouPassword } from "@/domain/entities/user.entity.js"
import { IUserRepository } from "@/domain/repositories/IUser.repository.js"
import { DatabaseModels } from "./database/clientSchema.database.js"
import { UserMapper } from "../mapper/user.mapper.js"
import { ClientSession } from "mongoose"
import { TYPES } from "../types/dependency.type.js"
import { Inject, Injectable } from "@nestjs/common"


@Injectable()
export class UserRepository extends BaseRepository<IUserDocument, IUser> implements IUserRepository {
  async linkGoogle(id: string, googleId: string): Promise<boolean> {
    const result = await this.db.User.updateOne(
      { _id: id, deleted_at: null, $or: [{ googleId: { $exists: false } }, { googleId: null }] },
      { $set: { googleId } },
    );
    return result.modifiedCount === 1;
  }

  async findByEmailCaseInsensitive(email: string): Promise<IUser | null> {
    const doc = await this.db.User.findOne({ email }).collation({ locale: 'en', strength: 2 });
    return doc ? this.UserMapper.toDomain(doc) : null;
  }

  protected toDomain(doc: IUserDocument): IUser {
    return this.UserMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<IUserDocument>): Partial<IUser> {
    return this.UserMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: Partial<IUser>): Partial<IUserDocument> {
    return this.UserMapper.toPersistencePartial(doc)
  }
  protected toPresistencePartial(doc: Partial<IUser>): Partial<IUserDocument> {
    return this.UserMapper.toPersistencePartial(doc)
  }
  constructor(
    @Inject(TYPES.DatabaseType) private readonly db: DatabaseModels,
    @Inject(TYPES.UserMapper) private readonly UserMapper: UserMapper,
  ) { super(db.User) }
  async update(
    id: string,
    user: Partial<IUser>,
    session?: ClientSession
  ): Promise<Partial<IUser> | null> {
    const update = await this.db.User.findByIdAndUpdate(
      id,
      this.UserMapper.toPersistencePartial(user),
      { session }
    );

    if (!update) {
      return update;
    }
    return this.UserMapper.toDomain(update);
  }

  async searchByEmail(email: string): Promise<Partial<IUserWithouPassword>[]> {
    const results = await this.db.User.find({
      email: {
        $regex: `${email}`,
      },
    });

    return results.map((result)=>this.UserMapper.toDomainWithoutPassword(result));
  }

  async searchByEmailWithout(email: string, ids: string[],limit:number=100): Promise<Partial<IUserWithouPassword>[]> {
    const results = await this.db.User.find({
      email: {
        $regex: `${email}`,
      },
      _id:{
        $nin:ids
      }
    }).limit(100);

    return results.map((result)=>this.UserMapper.toDomainWithoutPassword(result));
  }

  async searchByManyEmail(email:string[],session?:ClientSession):Promise<IUserWithouPassword[]>{
    const results = await this.db.User.find({
      email: {
        $in:email
      },
    }).session(session??null);

    return results.map((result)=>this.UserMapper.toDomainWithoutPassword(result))
  }
}


