export type IRole="user"|"admin"

export interface IUser{
    id:string,
    email:string,
    password:string,
    name:string,
    avatar?:string,
    role:IRole,
    created_at:Date,
    updated_at?:Date|null,
    deleted_at?:Date|null
}

export type IUserWithouPassword = Omit<IUser,"password">