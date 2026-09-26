import { inject, injectable } from "tsyringe";
import { TYPES } from "../container/type.container";
import { IListRepository } from "@/app/core/domain";
import { IList } from "@/app/core/domain/entities";
import { BaseRepository } from "./base.repositories";
import {
  IListDocument,
  IListPopulateDocument,
  IMemberDocument,
} from "./database/interface";
import { ListMapper } from "./mapper/list.mapper";
import { IListWithId } from "../../domain/entities/list.entities";
import { ClientSession, Types } from "mongoose";
import { DatabaseModels } from "./database/clientSchema.database";
import { DashboardListsResult } from "../../DTO/list/list.DTO";
import { Rubik_Doodle_Shadow } from "next/font/google";

@injectable()
export class ListRepository
  extends BaseRepository<IListDocument, IListWithId, string>
  implements IListRepository
{
  protected toDomain(doc: IListDocument): IListWithId {
    return this.ListMapper.toDomain(doc);
  }
  protected toDomainPartial(doc: Partial<IListDocument>): Partial<IListWithId> {
    return this.ListMapper.toDomainPartial(doc);
  }
  protected toPresistence(doc: Partial<IListWithId>): Partial<IListDocument> {
    return this.ListMapper.toPersistencePartial(doc);
  }
  protected toPresistencePartial(
    doc: Partial<IListWithId>,
  ): Partial<IListDocument> {
    return this.ListMapper.toPersistencePartial(doc);
  }

  constructor(
    @inject(TYPES.DatabaseType) private readonly db: DatabaseModels,
    @inject(TYPES.ListMapper) private readonly ListMapper: ListMapper,
  ) {
    super(db.List);
  }

  async deleteByPath(path: string, session?: ClientSession): Promise<boolean> {
    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

    const doc = await this.db.List.deleteMany({
      path: { $regex: `^${escapedPath}(/|$)` },
    }).session(session ?? null);
    return doc.deletedCount > 0;
  }

  async getListAll(
    userId: string,
    session?: ClientSession,
  ): Promise<DashboardListsResult> {
    const member =
      (
        await this.db.Member.find({ user: userId })
          .session(session ?? null)
          .select("_id")
          .lean()
      ).map((m) => m._id) ?? [];

    const userObjectId = new Types.ObjectId(userId);
    const baseAccessMatch = {
      deleted_at: null,
      $or: [{ user: userObjectId }, { members: { $in: member } }],
    };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);
    const next7DaysStart = new Date(todayStart);
    next7DaysStart.setDate(next7DaysStart.getDate());
    next7DaysStart.setHours(0, 0, 0, 0);
    const next7DaysEnd = new Date(todayStart);
    next7DaysEnd.setDate(next7DaysEnd.getDate() + 7);
    next7DaysEnd.setHours(23, 59, 59, 999);
    const lists = await this.db.List.aggregate([
      { $match: { ...baseAccessMatch } },
      { $addFields: { sectionIds: "$sections" } },
      { $addFields: { memberIds: "$members" } },
      {
        $lookup: {
          from: "sections",
          let: { ids: "$sectionIds" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$ids"] } } },
            {
              $addFields: {
                order: { $indexOfArray: ["$$ids", "$_id"] },
              },
            },
            { $sort: { order: 1 } },
            {
              $lookup: {
                from: "tasks",
                foreignField: "section",
                localField: "_id",
                as: "tasks",
                pipeline: [
                  {
                    $lookup: {
                      from: "rules",
                      foreignField: "task",
                      localField: "_id",
                      as: "rules",
                    },
                  },
                  {
                    $set: {
                      rule: { $arrayElemAt: ["$rules", 0] },
                    },
                  },
                  { $unset: "rules" },
                ],
              },
            },
          ],
          as: "sections",
        },
      },
      {
        $lookup: {
          from: "members",
          let: { ids: "$memberIds" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$ids"] } } },
            {
              $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "user",
                as: "userData",
                pipeline: [{ $project: { _id: 1, name: 1, email: 1 } }],
              },
            },
            { $set: { user: { $arrayElemAt: ["$userData", 0] } } },
            { $unset: "userData" },
          ],
          as: "members",
        },
      },
      { $unset: "sectionIds" },
      { $unset: "memberIds" },
    ]).session(session ?? null);

    return {
      lists: lists.map((doc) => this.ListMapper.toDomainPopulate(doc)),
    };
  }

  async findByIdPopulate(id: string): Promise<IList | null> {
    const list = (await this.db.List.findOne({
      _id: id,
      deleted_at: null,
    }).populate([
      {
        path: "sections",
        match: {
          deleted_at: null,
        },
        populate: [
          {
            path: "tasks",
            match: {
              deleted_at: null,
            },
            populate: [
              {
                path: "rule",
              },
            ],
          },
        ],
      },
    ])) as unknown as IListPopulateDocument;
    return list ? this.ListMapper.toDomainPopulate(list) : null;
  }

  async findListByUser(userId: string): Promise<Partial<IList>[]> {
    const docs = await this.db.List.aggregate([
      {
        $lookup: {
          from: "members",
          let: { listId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$list", "$$listId"] },
                    { $eq: ["$user", new Types.ObjectId(userId)] },
                    { $eq: ["$status", "accept"] },
                  ],
                },
              },
            },
          ],
          as: "membership",
        },
      },
      {
        $match: {
          $or: [
            { user: new Types.ObjectId(userId) },
            { membership: { $ne: [] } },
          ],
          deleted_at: null,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);
    return docs.map((d) => this.ListMapper.toDomainPartialPopulate(d));
  }

  async pushSectionsIntoList(DTO: {
    sectionIds: string[];
    listId: string;
    session?: ClientSession;
  }): Promise<void> {
    const { sectionIds, listId, session } = DTO;
    await this.db.List.updateOne(
      { _id: listId },
      {
        $addToSet: {
          sections: { $each: sectionIds },
        },
      },
      { session },
    );
  }

  async pullSectionsOutOfList(DTO: {
    sectionIds: string[];
    listId: string;
    session?: ClientSession;
  }) {
    const { listId, sectionIds, session } = DTO;
    await this.db.List.findByIdAndUpdate(listId, {
      $pull: {
        sections: {
          $in: sectionIds.map((section) => new Types.ObjectId(section)),
        },
      },
    }).session(session ?? null);
  }

  async pushMembersIntoList(DTO: {
    memberIds: string[];
    listId: string;
    session?: ClientSession;
  }): Promise<void> {
    const { memberIds, listId, session } = DTO;
    await this.db.List.updateOne(
      { _id: listId },
      {
        $addToSet: {
          members: { $each: memberIds },
        },
      },
      { session },
    );
  }

  async pullMembersOutOfList(DTO: {
    memberIds: string[];
    listId: string;
    session?: ClientSession;
  }): Promise<void> {
    const { listId, memberIds, session } = DTO;
    await this.db.List.findByIdAndUpdate(listId, {
      members: {
        $pull: {
          $in: memberIds.map((memberIds) => new Types.ObjectId(memberIds)),
        },
      },
    }).session(session ?? null);
  }

  async pushTagsIntoList(pushTagDTO: {
    share_tags: {
      tag: string;
      created_by: string;
    }[];
    listId: string;
    session?: ClientSession;
  }): Promise<void> {
    await this.db.List.updateOne(
      { _id: pushTagDTO.listId },
      {
        $addToSet: {
          shared_tags: {
            $each: pushTagDTO.share_tags.map((share_tag) => ({
              tag: share_tag.tag,
              created_by: share_tag.created_by,
              created_at: new Date(),
            })),
          },
        },
      },
      { session: pushTagDTO.session },
    );
  }

  async pullTagsOutOfList(DTO: {
    nameTags: string[];
    listIds: string[];
    session?: ClientSession;
  }): Promise<void> {
    const { listIds, nameTags, session } = DTO;
    await this.db.List.updateMany(
      { _id: { $in: listIds.map((id) => new Types.ObjectId(id)) } },
      {
        $pull: {
          shared_tags: { tag: { $in: nameTags } },
        },
      },
      { session, collation: { locale: "vi", strength: 2 } },
    );
  }

  async getTagInList(
    listId: string,
    session?: ClientSession,
  ): Promise<{ _id: string; tags: string[] } | null> {
    const doc = await this.db.List.findOne({
      _id: listId,
    })
      .session(session ?? null)
      .select({
        shared_tags: true,
      })
      .populate<{
        shared_tags: {
          tag: string;
        }[];
      }>([{ path: "shared_tags.tag" }]);

    if (!doc) {
      return null;
    }
    return {
      _id: doc?._id.toString(),
      tags: doc.shared_tags.map((shared_tag) => shared_tag.tag) ?? [],
    };
  }

  async getMemberInList(
    listId: string,
    session?: ClientSession,
  ): Promise<{
    _id: string;
    members: { memberId: string; userId: string }[];
  } | null> {
    const doc = (await this.db.List.findById(new Types.ObjectId(listId))
      .select({
        members: true,
      })
      .session(session ?? null)
      .populate([
        {
          path: "members",
          select: {
            _id: true,
            user: true,
          },
        },
      ])) as unknown as {
      _id: Types.ObjectId;
      members: {
        _id: Types.ObjectId;
        user: Types.ObjectId;
      }[];
    };

    if (!doc) {
      return null;
    }

    return {
      _id: doc._id.toString(),
      members: doc.members.map((member) => {
        return {
          memberId: member._id.toString(),
          userId: member.user.toString(),
        };
      }),
    };
  }

  async getListByUser(DTO: { userId: string }): Promise<IListWithId[]> {
    const { userId } = DTO;

    const getLists = await this.db.List.aggregate([
      {
        $lookup: {
          from: "members",
          localField: "members",
          foreignField: "_id",
          as: "membersData",
        },
      },
      {
        $match: {
          "membersData.user": new Types.ObjectId(userId),
        },
      },
    ]);

    return getLists.map((list) => this.toDomain(list));
  }

  async getListByTagNameAndUserId(DTO: {
    tagName: string[];
    userId: string;
  }): Promise<IListWithId[]> {
    const { tagName, userId } = DTO;
    const docs = await this.db.List.aggregate(
      [
        {
          $lookup: {
            from: "members",
            localField: "members",
            foreignField: "_id",
            as: "membersData",
          },
        },
        {
          $match: {
            "membersData.user": new Types.ObjectId(userId),
            "shared_tags.tag": { $in: tagName },
          },
        },
      ],
      {
        collation: { locale: "vi", strength: 2 },
      },
    );

    return docs.map((doc) => this.toDomain(doc));
  }

  async updateListShareTag(DTO: {
    currentName: string;
    newName: string;
    listIds: string[];
    session?: ClientSession;
  }): Promise<void> {
    const { currentName, newName, listIds, session } = DTO;
    await this.db.List.updateMany(
      {
        _id: { $in: listIds.map((listId) => new Types.ObjectId(listId)) },
        "shared_tags.tag": currentName.toLocaleLowerCase(),
      },
      {
        $set: { "shared_tags.$[elem].tag": newName },
      },
      {
        session,
        collation: { locale: "vi", strength: 2 },
        arrayFilters: [{ "elem.tag": currentName.toLocaleLowerCase() }],
      },
    );
  }

  async getShareTagFromList(DTO: {
    listIds: string[];
    session?: ClientSession;
  }): Promise<
    {
      listId: string;
      tags: string[];
    }[]
  > {
    const { listIds, session } = DTO;
    const docs = await this.db.List.find({
      _id: {
        $in: listIds.map((listId) => new Types.ObjectId(listId)),
      },
    })
      .select({
        _id: 1,
        shared_tags: 1,
      })
      .session(session ?? null);
    return docs.map((doc) => {
      return {
        listId: doc._id.toString(),
        tags: doc.shared_tags.map((shareTag) => shareTag.tag),
      };
    });
  }

  async getMemberAndTagFromList(DTO: {
    listIds: string[];
    session?: ClientSession;
  }): Promise<
    {
      listId: string;
      tags: string[];
      members: {
        id: string;
        userId: string;
      }[];
    }[]
  > {
    const { listIds, session } = DTO;
    const docs = (await this.db.List.aggregate([
      {
        $lookup: {
          from: "members",
          foreignField: "_id",
          localField: "members",
          as: "membersData",
          pipeline: [
            {
              $match: {
                status: "accept",
              },
            },
          ],
        },
      },
      {
        $match: {
          _id: {
            $in: listIds.map((listId) => new Types.ObjectId(listId)),
          },
        },
      },
      {
        $project: {
          membersData: true,
          shared_tags: true,
        },
      },
    ]).session(session ?? null)) as {
      _id: Types.ObjectId;
      membersData: IMemberDocument[];
      shared_tags: {
        tag: string;
      }[];
    }[];
    return docs.map((doc) => {
      return {
        listId: doc._id.toString(),
        members: doc.membersData.map((member) => {
          return {
            id: member._id.toString(),
            userId: member.user.toString(),
          };
        }),
        tags: doc.shared_tags.map((shareTag) => shareTag.tag),
      };
    });
  }

  async getInbox(DTO: { userId: string }): Promise<IList | null> {
    const { userId } = DTO;
    const doc = (await this.db.List.findOne({
      user: userId,
      name: "Inbox",
    }).populate({
      path: "sections",
      populate: [
        {
          path: "tasks",
          populate: [
            {
              path: "rule",
            },
          ],
        },
      ],
    })) as unknown as IListPopulateDocument;

    if (!doc) {
      return null;
    }

    return this.ListMapper.toDomainPopulate(doc);
  }

  async getCurrentTag(DTO: {
    listId: string;
    session?: ClientSession;
  }): Promise<{ tags: string[] }> {
    const { listId, session } = DTO;
    const s = session ?? null;
    const ruleDocs = await this.db.Rule.find({
      list: listId,
      deleted_at: undefined,
    }).session(s);
    const tagsOfRule = ruleDocs.flatMap((doc) => doc.tags ?? []);
    const uniqueTags = [...new Set(tagsOfRule)];
    return { tags: uniqueTags };
  }
  async getListAndSection(DTO: {
    userId: string;
    session?: ClientSession;
  }): Promise<{ lists: Pick<IList, "name" | "id" | "sections">[] }> {
    const { userId, session } = DTO;
    const docs = await this.db.List.aggregate([
      {
        $lookup: {
          from: "members",
          localField: "members",
          foreignField: "_id",
          as: "membersData",
        },
      },
      {
        $match: {
          membersData: {
            $elemMatch: {
              user: new Types.ObjectId(userId),
              role: { $ne: "read only" },
              status: "accept",
            },
          },
        },
      },
      {
        $project: {
          id: 1,
          name: 1,
        },
      },
    ]).session(session ?? null);
    return {
      lists: docs.map((doc) => {
        return {
          id: doc._id.toString(),
          name: doc.name,
        };
      }),
    };
  }
}
