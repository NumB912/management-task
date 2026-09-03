
import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { BaseRepository } from "./base.repositories";
import { IRuleDocument } from "./database/interface";
import { RuleMapper } from "./mapper/rule.mapper";
import { IRuleWithId } from "../../domain/entities/rule.entities";
import { IRuleRepository } from "../../domain";
import { ClientSession, Types } from "mongoose";
import { DatabaseModels } from "./database/clientSchema.database";
@injectable()
export class RuleRepository extends BaseRepository<IRuleDocument, IRuleWithId, string> implements IRuleRepository {
  protected toDomain(doc: IRuleDocument): IRuleWithId {
    return this.RuleMapper.toDomain(doc)
  }
  protected toDomainPartial(doc: Partial<IRuleDocument>): Partial<IRuleWithId> {
    return this.RuleMapper.toDomainPartial(doc)
  }
  protected toPresistence(doc: Partial<IRuleWithId>): Partial<IRuleDocument> {
    return this.RuleMapper.toPersistencePartial(doc)
  }
  protected toPresistencePartial(doc: Partial<IRuleWithId>): Partial<IRuleDocument> {
    return this.RuleMapper.toPersistencePartial(doc)
  }
  constructor(@inject(TYPES.DatabaseType) private readonly db: DatabaseModels, @inject(TYPES.RuleMapper) private readonly RuleMapper: RuleMapper) { super(db.Rule); }
  pushTagsIntoRule(ruleId: string, tags: string[], session?: unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async pullTagsOutOfRule(DTO: {
    nameTags: string[];
    ruleIds: string[];
    session?: ClientSession;
  }): Promise<{ matchedCount: number; modifiedCount: number }> {
    const { nameTags, ruleIds, session } = DTO;
    const ruleObjectIds = ruleIds.map((taskId) => new Types.ObjectId(taskId));

    const result = await this.db.Rule.updateMany(
      {
        _id: { $in: ruleObjectIds },
        "tags": { $in: nameTags },
      },
      {
        $pull: {
          tags: { $in: nameTags },
        },
      },
      { session, collation: { locale: "vi", strength: 2 } }
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }


  async getRuleInListAndTags(DTO: { listIds: string[]; nameTags: string[] }): Promise<{
    _id: string,
    rules: IRuleWithId[]
  }[]> {
    const { listIds, nameTags } = DTO;
    const getData = await this.db.List.aggregate([
      {
        $match: {
          _id: { $in: listIds.map((id) => new Types.ObjectId(id)) },
        },
      },
      {
        $lookup: {
          from: "sections",
          localField: "sections",
          foreignField: "_id",
          as: "sectionsData",
        },
      },
      {
        $lookup: {
          from: "rules",
          localField: "sectionsData.tasks",
          foreignField: "task",
          as: "rulesData",
        },
      }, {
        $match: {
          "rulesData.tags": { $in: nameTags },
        },
      }, {
        $project: {
          rulesData: {
            $filter: {
              input: "$rulesData",
              as: "rule",
              cond: {
                $gt: [
                  { $size: { $setIntersection: ["$$rule.tags", nameTags] } },
                  0,
                ],
              },
            },
          },
        },
      },

    ], {
      collation: { locale: "vi", strength: 2 },
    }) as unknown as {
      _id: Types.ObjectId,
      rulesData: IRuleDocument[]
    }[];

    return getData.map((data) => {
      return {
        _id: data._id.toString(),
        rules: data.rulesData.map((rule) => this.RuleMapper.toDomain(rule))
      }
    });
  }

  async getRuleByTags(DTO:{tags:string[],userId:string,session?:unknown}){
    const {tags,userId} = DTO
    const docs = await this.db.Rule.aggregate([{
      $lookup:{
        from:"lists",
        foreignField:"_id",
        localField:"list",
        as:"listsData",
        pipeline:[{
          $lookup:{
              from:"members",
              foreignField:"_id",
              localField:"members",
              as:"listsData",
          }
        }]
      }
    }])

  }

  async updateRuleTag(DTO: { ruleIds: string[]; currentName: string; newName: string; session?: ClientSession; }): Promise<void> {
    const { currentName, newName, ruleIds, session } = DTO
     await this.db.Rule.updateMany({
      tags: currentName.toLocaleLowerCase(),
      _id: {
        $in: ruleIds.map(ruleId => new Types.ObjectId(ruleId))
      }
    }, {
      $set: { "tags.$[element]": newName },
    },
      {
        session,
        collation: { locale: "vi", strength: 2 },
        arrayFilters: [{ "element": currentName }],
      })
  }

    async deleteByPath(path: string,session?:ClientSession):Promise<boolean> {
      const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      
      const doc = await this.db.Rule.deleteMany({
        path: { $regex: `^${escapedPath}(/|$)` },
      }).session(session??null);
      return doc.deletedCount>0;
    }
}

