import { IMember } from "./member.entities"
import { ISection } from "./section.entities"


export interface IList {
    id: string,
    name: string,
    sections?: ISection[],
    members: IMember[],
    path: string,
    user: string,
    order: number,
    isShareList:boolean,
    shared_tags: {
        tag: string,
        created_at?: Date,
        created_by: string
    }[]
    created_at: Date,
    updated_at?: Date,
    deleted_at?: Date
}

export interface IListWithId extends Omit<IList, "sections" | "members"> {
    sections: string[]
    members: string[]
}

export interface IListPartial extends Partial<Omit<IList,"sections"|"members">>{
    sections?:Partial<ISection>
    members?:Partial<IMember>
}