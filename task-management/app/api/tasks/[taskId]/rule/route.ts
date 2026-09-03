
import { UpdateRuleUsecase } from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,{params}:{ params: Promise<{ taskId:string }> }){
  const body = await req.json()
  const rule = body
  const resolvedParams = await params;
  const {taskId} = resolvedParams;
    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
    email: string,
    role: "user" | "admin",
    id: string
  }
  const UpdateTaskUsecase = await (await GetContainer())
    .resolve<UpdateRuleUsecase>(TYPES.UpdateRuleUsecase)
    .execute(taskId,rule,user.id);

  return NextResponse.json(
    { message: "Thành công", data: UpdateTaskUsecase },
    { status: 200 },
  );
}