import { IList } from "@/app/core/domain";
import { IListDocument, IListPopulateDocument, IMemberPopulateDocument, ISectionPopulateDocument } from "../database/interface";
import { Types } from "mongoose";
import { IListWithId } from "@/app/core/domain/entities/list.entities";
import { IMapper } from "@/app/core/domain/mapper/Imapper.mapper";
import { SectionMapper } from "./section.mapper";
import { MemberMapper } from "./member.mapper";


export class ListMapper implements IMapper<IListDocument, IListWithId, IListPopulateDocument, IList> {
  constructor(
    private readonly memberMapper: MemberMapper,
    private readonly sectionMapper: SectionMapper,
  ) { }

  toDomain(doc: IListDocument): IListWithId {
    return {
      id: doc._id.toString(),
      name: doc.name,
      order: doc.order,
      path: doc.path,
      user: doc.user.toString(),
      isShareList:doc.isShareList,
      sections: doc.sections?.map((section) => section._id.toString()) ?? [],
      members: doc.members?.map((member) => member._id.toString()) ?? [],
      shared_tags: doc.shared_tags?.map((shared_tag) => {
        return {
          created_by: shared_tag.created_by._id.toString(),
          tag: shared_tag.tag.toString(),
          created_at: shared_tag.created_at
        }
      }) ?? [],
      created_at: doc.created_at,
      deleted_at: doc.deleted_at ?? undefined,
      updated_at: doc.updated_at ?? undefined,
    };
  }

  toDomainPartial(doc: Partial<IListDocument>): Partial<IListWithId> {
    const partial: Partial<IListWithId> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.order) partial.order = doc.order;
    if (doc.path) partial.path = doc.path;
    if (doc.user) partial.user = doc.user.toString();
    if (doc.members) partial.members = doc.members?.map((member) => member.toString())
    if (doc.isShareList) partial.isShareList = doc.isShareList
    if (doc.sections) partial.sections = doc.sections.map((section) => section.toString())
    if (doc.shared_tags) partial.shared_tags = doc.shared_tags.map((tag)=>{
      return {
        created_by:tag.created_by.toString(),
        tag:tag.tag,
        created_at:tag.created_at
      }
    })
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainPopulate(doc: IListPopulateDocument): IList {
    return {
      id: doc._id.toString(),
      name: doc.name,
      order: doc.order,
      path: doc.path,
      user: doc.user.toString(),
      isShareList:doc.isShareList,
      members: doc.members?.map((member) => this.memberMapper.toDomainPopulate(member)) ?? [],
      sections: doc.sections?.map(section => this.sectionMapper.toDomainPopulate(section)) ?? [],
      shared_tags: doc.shared_tags ? doc.shared_tags?.map((shared_tag) => {
        return {
          created_by: shared_tag.created_by._id.toString(),
          tag: shared_tag.tag,
          created_at: shared_tag.created_at
        }
      }) : [],
      created_at: doc.created_at,
      deleted_at: doc.deleted_at ?? undefined,
      updated_at: doc.updated_at ?? undefined,
    };
  }

  toDomainPartialPopulate(doc: Partial<IListPopulateDocument>): Partial<IList> {
    const partial: Partial<IList> = {};
    if (doc._id) partial.id = doc._id.toString();
    if (doc.name) partial.name = doc.name;
    if (doc.order) partial.order = doc.order;
    if (doc.path) partial.path = doc.path;
    if (doc.user) partial.user = doc.user.toString();
    if (doc.sections) partial.sections = doc.sections.map((section) => this.sectionMapper.toDomainPopulate(section));
    if (doc.members) partial.members = doc.members.map((member) => this.memberMapper.toDomainPopulate(member));
    if (doc.shared_tags) partial.shared_tags = doc.shared_tags ? doc.shared_tags?.map((shared_tag) => {
      return {
        created_by: shared_tag.created_by._id.toString(),
        tag: shared_tag.tag,
        created_at: shared_tag.created_at
      }
    }) : []
    if (doc.isShareList) partial.isShareList = doc.isShareList
    if (doc.created_at) partial.created_at = doc.created_at;
    if (doc.updated_at) partial.updated_at = doc.updated_at ?? undefined;
    if (doc.deleted_at) partial.deleted_at = doc.deleted_at ?? undefined;
    return partial;
  }

  toDomainList(docs: IListDocument[]): IListWithId[] {
    return docs.map(doc => this.toDomain(doc));
  }

  toDomainPopulateList(docs: IListPopulateDocument[]): IList[] {
    return docs.map(doc => this.toDomainPopulate(doc));
  }

  toPersistence(list: IListWithId): Partial<IListDocument> {
    return {
      _id: new Types.ObjectId(list.id),
      name: list.name,
      path: list.path,
      order: list.order ?? 0,
      user: new Types.ObjectId(list.user),
      sections: list.sections?.map(s => new Types.ObjectId(s)) ?? [],
      members: list.members.map((member) => new Types.ObjectId(member)) ?? [],
      isShareList:list.isShareList,
      shared_tags: list.shared_tags.map((s) => {
        return {
          created_by: new Types.ObjectId(s.created_by),
          tag: s.tag,
          created_at: s.created_at,
        }
      }) ?? [],
      created_at: list.created_at,
      updated_at: list.updated_at ?? null,
      deleted_at: list.deleted_at ?? null,
    };
  }

  toPersistencePartial(list: Partial<IListWithId>): Partial<IListDocument> {
    const update: Partial<IListDocument> = {};
    if (list.id) update._id = new Types.ObjectId(list.id);
    if (list.name) update.name = list.name;
    if (list.path) update.path = list.path;
    if (list.order) update.order = list.order;
    if (list.user) update.user = new Types.ObjectId(list.user);
    if (list.isShareList) update.isShareList = list.isShareList
    if (list.sections) update.sections = list.sections.map(s => new Types.ObjectId(s));
    if (list.members) update.members = list.members.map(s => new Types.ObjectId(s));
    if (list.shared_tags) update.shared_tags = list.shared_tags.map((s) => {
      return {
        created_by: new Types.ObjectId(s.created_by),
        tag: s.tag,
        created_at: s.created_at,
      }
    });
    return update;
  }

  toPersistencePopulate(list: IList): Partial<IListPopulateDocument> {
    return {
      _id: new Types.ObjectId(list.id),
      name: list.name,
      path: list.path,
      order: list.order,
      user: new Types.ObjectId(list.user),
      isShareList:list.isShareList,
      sections: list.sections?.map(s => this.sectionMapper.toPersistencePopulate(s) as ISectionPopulateDocument) ?? [],
      members: list.members?.map(s => this.memberMapper.toPersistencePopulate(s) as IMemberPopulateDocument) ?? [],
      shared_tags: list.shared_tags.map((s) => {
        return {
          created_by: new Types.ObjectId(s.created_by),
          tag: s.tag,
          created_at: s.created_at,
        }
      }),
      created_at: list.created_at,
      updated_at: list.updated_at ?? null,
      deleted_at: list.deleted_at ?? null,
    };
  }

  toPersistencePartialPopulate(list: Partial<IList>): Partial<IListPopulateDocument> {
    const update: Partial<IListPopulateDocument> = {};
    if (list.name) update.name = list.name;
    if (list.path) update.path = list.path;
    if (list.order) update.order = list.order;
    if (list.sections) {
      update.sections = list.sections.map(s => this.sectionMapper.toPersistencePopulate(s) as ISectionPopulateDocument);
    }
    if (list.isShareList) update.isShareList = list.isShareList
    if (list.members) update.members = list.members.map(s => this.memberMapper.toPersistencePopulate(s) as IMemberPopulateDocument);
    if (list.shared_tags) update.shared_tags = list.shared_tags.map((s) => {
      return {
        created_by: new Types.ObjectId(s.created_by),
        tag:s.tag,
        created_at: s.created_at,
      }
    });

    return update;
  }
}