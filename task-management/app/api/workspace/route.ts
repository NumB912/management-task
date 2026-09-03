
import { WorkSpaceUsecase } from "@/app/core/application/usecase/workSpace/workspace.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const data = await (await GetContainer())
    .resolve<WorkSpaceUsecase>(TYPES.WorkSpaceUsecase)
    .execute({
      userId:user.id
    });
  return NextResponse.json({data}, { status: 200 });
}