import { NextRequest, NextResponse } from "next/server";
import { middlewareFn } from "./types.middleware";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { CheckOwnerTagUsecase } from "@/app/core/application/usecase/middleware/checkOwnerTag.usecase";
export const checkOwnerTag =async (): Promise<middlewareFn> => {
    const CheckOwnerTagUsecase =(await GetContainer()).resolve<CheckOwnerTagUsecase>(TYPES.CheckOwnerTagUsecase)
    return async (req: NextRequest) => {
        try {
            const {tagId} = JSON.parse(req.headers.get("x-params")??"") as {
                tagId:string
            }
            const user = JSON.parse(req.headers.get("x-user") ?? "") as {
                email: string,
                role: "user" | "admin",
                id: string
            }   
            const isPermission = await CheckOwnerTagUsecase.execute(user.id,tagId)
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