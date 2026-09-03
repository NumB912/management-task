
import { ISection, ISectionRepository } from "@/app/core/domain";
import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { BaseRepository } from "./base.repositories";
import { ISectionWithId } from "../../domain/entities/section.entities";
import { ISectionDocument, ISectionPopulateDocument } from "./database/interface";
import { SectionMapper } from "./mapper/section.mapper";
import { DatabaseModels } from "./database/clientSchema.database";
import { ClientSession, Types } from "mongoose";

@injectable()
export class SectionRepository
  extends BaseRepository<ISectionDocument, ISectionWithId, string>
  implements ISectionRepository {
  protected toDomain(doc: ISectionDocument): ISectionWithId {
    return this.SectionMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<ISectionDocument>): Partial<ISectionWithId> {
    return this.SectionMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: Partial<ISectionWithId>): Partial<ISectionDocument> {
    return this.SectionMapper.toPersistencePartial(doc)
  }
  protected toPresistencePartial(doc: Partial<ISectionWithId>): Partial<ISectionDocument> {
    return this.SectionMapper.toPersistencePartial(doc)
  }


  constructor(@inject(TYPES.DatabaseType) private readonly db: DatabaseModels, @inject(TYPES.SectionMapper) private readonly SectionMapper: SectionMapper) {
    super(db.Section);
  }

  async deleteByPath(path: string,session?:ClientSession):Promise<boolean> {
    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    const doc = await this.db.Section.deleteMany({
      path: { $regex: `^${escapedPath}(/|$)` },
    }).session(session??null);
    return doc.deletedCount>0;
  }
  async findSectionByList(listId: string, userId: string): Promise<Partial<ISection>[]> {
    const docs = await this.db.Section.find({
      list: listId,
      deleted_at:null
    }).populate<ISectionPopulateDocument>({
      path: "tasks",
      populate: {
        path: "rule",
        populate: {
          path: "tags"
        }
      }
    })

    return docs.map((section) => this.SectionMapper.toDomainPartialPopulate(section))
  }

  async pushTaskIntoSection(DTO:{id:string,tasks:string[],session?:ClientSession}):Promise<void>{
    const {id,tasks,session}  = DTO
    const doc = await this.db.Section.updateOne({
      _id:id,
    },{
      $addToSet:{
        tasks:{
          $each:tasks.map((task)=>new Types.ObjectId(task))
        }
      }
    }).session(session??null)
  }
async pullTaskFromSection(DTO: { id: string; tasks: string[]; session?: ClientSession }): Promise<void> {
  const { id, tasks, session } = DTO;

  await this.db.Section.updateOne(
    { _id: id },
    {
      $pull: {
        tasks: { $in: tasks.map((task) => new Types.ObjectId(task)) }, 
      },
    }
  ).session(session ?? null);
}

async findByTaskId(taskId: string, session?: ClientSession): Promise<ISectionWithId | null> {
  const doc = await this.model.findOne(
    { tasks: taskId, deleted_at: undefined },
    null,
    { session },
  );
  if (!doc) return null;
  return this.toDomain(doc);
}

}


