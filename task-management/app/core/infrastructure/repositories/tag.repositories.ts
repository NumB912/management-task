
import { ITagRepository } from "@/app/core/domain";
import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { BaseRepository } from "./base.repositories";
import { TagMapper } from "./mapper/tag.mapper";
import { ITagDocument } from "./database/interface";
import { ITag, ITagWithId } from "../../domain/entities/tag.entities";
import { Types, ClientSession } from "mongoose";
import { TaskMapper } from "./mapper/task.mapper";
import { DatabaseModels } from "./database/clientSchema.database";
@injectable()
export class TagRepository extends BaseRepository<ITagDocument, ITagWithId> implements ITagRepository {
  protected toDomain(doc: ITagDocument): ITagWithId {
    return this.TagMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<ITagDocument>): Partial<ITagWithId> {
    return this.TagMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: Partial<ITagWithId>): Partial<ITagDocument> {
    return this.TagMapper.toPersistencePartial(doc)
  }
  protected toPresistencePartial(doc: Partial<ITagWithId>): Partial<ITagDocument> {
    return this.TagMapper.toPersistencePartial(doc)
  }

  constructor(@inject(TYPES.DatabaseType) private readonly db: DatabaseModels, @inject(TYPES.TagMapper) private readonly TagMapper: TagMapper, @inject(TYPES.TaskMapper) private readonly TaskMapper: TaskMapper) {
    super(db.Tag);
  }
  async updateByName(DTO: { name: string, userId: string; data: Partial<ITagWithId>; session?: ClientSession; }): Promise<ITagWithId | null> {
    const { name, data, session, userId } = DTO
    const updated = await this.db.Tag.findOneAndUpdate({
      name: name,
      user: userId
    }, {
      $set: this.toPresistencePartial(data)
    }, {
      collation: {
        locale: "vi",
        strength: 2
      },
      session,
      new: true,
    })
    if (!updated) {
      return null
    }

    return this.TagMapper.toDomain(updated)
  }

  async deleteByName(DTO: { name: string, userId: string, session?: ClientSession }): Promise<boolean> {
    const { name, userId, session } = DTO
    const result = await this.db.Tag.deleteOne(
      {
        "name": name,
        "user": userId
      },
      {
        collation: {
          locale: "vi",
          strength: 2
        },
        session,
      }
    );
    return result.deletedCount > 0;
  }

  async findTagByName(DTO: { name: string, userId: string }): Promise<ITagWithId | null> {
    const { name, userId } = DTO

    const findTag = await this.db.Tag.findOne({ name: name, user: new Types.ObjectId(userId) }).collation({
      locale: "vi",
      strength: 2,
    });

    if (!findTag) {
      return null
    }
    return this.TagMapper.toDomain(findTag)
  }

  async findTagsByName(DTO: { nameTags: string[], userId: string }): Promise<ITagWithId[]> {
    const { nameTags, userId } = DTO
    const findTags = await this.db.Tag.find({
      name: {
        $in: nameTags
      }, user: new Types.ObjectId(userId)
    }).collation({
      locale: "vi",
      strength: 2,
    });

    return findTags.map((tag) => this.TagMapper.toDomain(tag))
  }

  async findTagsByUsers(DTO: {
    userIds: string[];
    session?: ClientSession;
  }): Promise<{
    userId: string;
    tags: ITagWithId[];
  }[]> {
    const { userIds, session } = DTO;
    const docs = await this.db.Tag.find({
      user: {
        $in: userIds.map((userId) => new Types.ObjectId(userId)),
      },
    }).session(session ?? null);

    const tagsByUser = new Map<string, ITagWithId[]>();
    for (const doc of docs) {
      const uid = String(doc.user);
      if (!tagsByUser.has(uid)) {
        tagsByUser.set(uid, []);
      }
      tagsByUser.get(uid)!.push(doc as ITagWithId);
    }

    return userIds.map((userId) => ({
      userId,
      tags: tagsByUser.get(userId) ?? [],
    }));
  }
  async updateManyUserIdsAndName(DTO: {
    userIds: string[],
    curName: string,
    newName: string,
    session?: ClientSession
  }): Promise<void> {
    const { curName, newName, userIds, session } = DTO
    await this.db.Tag.updateMany({
      _id: {
        $in: userIds.map((userId) => new Types.ObjectId(userId))
      },
      name: curName
    }, {
      $set: {
        name: newName
      }
    }, {
      session,
      collation: { locale: "vi", strength: 2 },
    })

  }

  async isUserHaveTag(DTO:{
    userId:string,
    tagNames:string[],
    session:ClientSession
  }):Promise<ITagWithId[]>{
    const {session,tagNames,userId} = DTO
    const doc = await this.db.Tag.find({
      user:userId,
      name:{
        $in:tagNames
      }
    }).session(session??null)

    
    return doc.map((doc)=>this.TagMapper.toDomain(doc))
  }

}


