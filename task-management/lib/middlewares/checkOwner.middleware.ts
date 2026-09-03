import { NextRequest, NextResponse } from "next/server";
import { middlewareFn } from "./types.middleware";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { CheckOwnerUsecase } from "@/app/core/application/usecase/middleware/checkOwnerList.usecase";
export const checkOwner =async (): Promise<middlewareFn> => {
    const CheckOwnerUsecase =(await GetContainer()).resolve<CheckOwnerUsecase>(TYPES.CheckOwnerUsecase)
    return async (req: NextRequest) => {
        try {
            const {listId} = JSON.parse(req.headers.get("x-params")??"") as {
                listId:string
            }
            const user = JSON.parse(req.headers.get("x-user") ?? "") as {
                email: string,
                role: "user" | "admin",
                id: string
            }   
            const isPermission = await CheckOwnerUsecase.execute(user.id,listId)
            if(!isPermission){
                return NextResponse.json({ error: "Không có quyền thực thi" }, { status: 500 })
            }
            return null;
        } catch (error) {
            console.error(error)
            return NextResponse.json({ error: "Lỗi" }, { status: 500 })
        }
    }
}