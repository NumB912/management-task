import { IUser } from "../../domain"

export type EditProfile = Partial<Omit<IUser,"id">>
export type LoginDTO = Pick<IUser,"email"|"password">