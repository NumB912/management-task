
import { DeleteTaskUsecase, UpdateTaskUsecase } from "@/app/core/application";
import { GetTaskByIdUsecase } from "@/app/core/application/usecase/task/findByTaskId.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId:string }> },
) {
  const resolvedParams = await params;
  const {taskId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<GetTaskByIdUsecase>(TYPES.GetTaskByIdUsecase)
    .execute(taskId);

  return NextResponse.json(
    { message: "Thành công", task:getByID },
    { status: 200 },
  );
}

export async function PATCH(req:NextRequest,{params}:{ params: Promise<{ taskId:string}> }){
    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
    email: string,
    role: "user" | "admin",
    id: string
  }
  const body = await req.json()
  const data = body
  const resolvedParams = await params;

  const {taskId} = resolvedParams;
  const UpdateTaskUsecase = await (await GetContainer())
    .resolve<UpdateTaskUsecase>(TYPES.UpdateTaskUsecase)
    .execute({data:data,id:taskId,userId:user.id});

  return NextResponse.json(
    { message: "Thành công", data: UpdateTaskUsecase },
    { status: 200 },
  );
}

export async function DELETE(req:NextRequest,{params}:{ params: Promise<{ taskId:string}> }){
  const resolvedParams = await params;
  const {taskId } = resolvedParams;
  const deleteUC = await (await GetContainer())
    .resolve<DeleteTaskUsecase>(TYPES.DeleteTaskUsecase)
    .execute(taskId);

  return NextResponse.json(
    { message: "Thành công", data: deleteUC },
    { status: 200 },
  );
}

