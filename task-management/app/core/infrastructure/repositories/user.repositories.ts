
import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { IUser } from "@/app/core/domain";
import { IUserRepository } from "../../domain/repositories/IUser.repository";
import { IUserWithouPassword } from "../../domain/entities/user.entites";
import { UserMapper } from "./mapper/user.mapper";
import { ClientSession } from "mongoose";
import { BaseRepository } from "./base.repositories";
import { IUserDocument } from "./database/interface";
import { DatabaseModels } from "./database/clientSchema.database";
@injectable()
export class UserRepository extends BaseRepository<IUserDocument, IUser> implements IUserRepository {
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
    @inject(TYPES.DatabaseType) private readonly db: DatabaseModels,
    private readonly UserMapper: UserMapper,
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


