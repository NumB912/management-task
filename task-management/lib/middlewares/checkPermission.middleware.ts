import { NextRequest, NextResponse } from "next/server";
import { middlewareFn } from "./types.middleware";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { CheckPermissionListUsecase } from "@/app/core/application/usecase/member/checkPermissionList.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { IRole } from "@/app/core/domain/entities/member.entities";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "ALL";
type PermissionMethodMap = Partial<Record<IRole, HttpMethod[]>>;

export const checkPermission = async (permissionAndMethod:PermissionMethodMap): Promise<middlewareFn> => {
    const CheckPermissionListUsecase = (await GetContainer()).resolve<CheckPermissionListUsecase>(TYPES.CheckPermissionListUsecase)
    return async (req: NextRequest) => {
        try { 
            const { listId } = JSON.parse(req.headers.get("x-params") ?? "") as {
                listId: string
            }
            const user = JSON.parse(req.headers.get("x-user") ?? "") as {
                email: string,
                role: IRole,
                id: string
            }|undefined
            if(!user){
               return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 500 })
            }
            const method = req.method as HttpMethod
            const isPermission = await CheckPermissionListUsecase.execute(user.id, listId, permissionAndMethod,method)

            if (!isPermission) {
                return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 500 })
            }
            return null;
        } catch (error) {
            console.error(error)
            return NextResponse.json({ error: "Lỗi trong quá trình thực thi" }, { status: 500 })
        }
    }
}