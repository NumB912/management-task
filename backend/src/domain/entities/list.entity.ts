import { IMember } from "./member.entity.js"
import { ISection } from "./section.entity.js"
import { ITask } from "./task.entity.js"


export interface IList {
    id: string,
    name: string,
    sections: ISection[],
    members: IMember[],
    path: string,
    user: string,
    order: number,
    tasks:ITask[],
    isShareList:boolean,
    shared_tags: string[]
    created_at: Date,
    updated_at?: Date,
    deleted_at?: Date
}

export interface IListWithId extends Omit<IList, "sections" | "members"|"tasks"> {
    sections: string[]
    members: string[]
    tasks:string[]
}

export interface IListPartial extends Partial<Omit<IList,"sections"|"members">>{
    sections?:Partial<ISection>
    members?:Partial<IMember>
}