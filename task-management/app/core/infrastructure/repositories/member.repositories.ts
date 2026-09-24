
import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { IMemberRepository } from "../../domain/repositories/IMember.repository";
import { ClientSession, Types } from "mongoose";
import { IMemberDocument } from "./database/interface";
import { BaseRepository } from "./base.repositories";
import { MemberMapper } from "./mapper/member.mapper";
import { IMemberWithId } from "../../domain/entities/member.entities";
import { DatabaseModels } from "./database/clientSchema.database";
@injectable()
export class MemberRepository
  extends BaseRepository<IMemberDocument, IMemberWithId, string>
  implements IMemberRepository {
  protected toDomain(doc: IMemberDocument): IMemberWithId {
    return this.MemberMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<IMemberDocument>): Partial<IMemberWithId> {
    return this.MemberMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: Partial<IMemberWithId>): Partial<IMemberDocument> {
    return this.MemberMapper.toPersistencePartial(doc)
  }
  protected toPresistencePartial(doc: Partial<IMemberWithId>): Partial<IMemberDocument> {
    return this.MemberMapper.toPersistencePartial(doc)
  }
  constructor(@inject(TYPES.DatabaseType) private readonly db: DatabaseModels, @inject(TYPES.MemberMapper) private readonly MemberMapper: MemberMapper) {
    super(db.Member);
  }

  async getMembersInLists(listIds: string[], session?: ClientSession):Promise<{
    id:string,
    members:IMemberWithId[]
  }[]>{
    const docs = await this.db.List.aggregate([{
      $lookup:{
        from:"members",
        foreignField:"_id",
        localField:"members",
        as:"membersData",
        pipeline:[{
          $match:{
            status:"accept"
          }
        }]
      }
    },{
      $match:{
        _id:{
          $in:listIds.map((listId)=>new Types.ObjectId(listId))
        },
      }
    },{
      $project:{
        membersData:true
      }
    }]).session(session??null) as {
      _id:Types.ObjectId,
      membersData:IMemberDocument[]
    }[]
    return docs.map((doc)=>{
      return {
        id:doc._id.toString(),
        members:doc.membersData.map((doc)=>this.MemberMapper.toDomain(doc))
      }
    })
  }

  async checkMembersIsExist(userIds: string[], listId: string,session?:ClientSession): Promise<string[]> {
    const docs = await this.db.Member.find({
      user: {
        $in: userIds,
      },
      deleted_at: null,
      list: listId
    }).session(session??null)
    return docs.map((doc) => doc.user.toString())
  }

  async searchMember(email: string, listId: string): Promise<void> {
    const docs = await this.db.Member.find({
    }).populate("list")
  }

}


