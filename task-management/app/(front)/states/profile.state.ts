import { create } from "zustand";
import { IUserModel } from "../model";

interface userProfileProp{
    open:boolean
    setOpen:(open:boolean)=>void
}

export const useProfile = create<userProfileProp>((set,get)=>({
    open:false,
    setOpen(open) {
        set((state)=>{
            return {
                open:open
            }
        })
    }
}))