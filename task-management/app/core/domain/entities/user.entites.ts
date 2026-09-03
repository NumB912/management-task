export interface IUser{
    id:string,
    email:string,
    password:string,
    name:string,
    avatar?:string,
    role:"user"|"admin"
    created_at:Date,
    updated_at?:Date,
    deleted_at?:Date
}

export type IUserWithouPassword = Omit<IUser,"password">