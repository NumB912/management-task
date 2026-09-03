
import { UpdateStatusUsecase } from "@/app/core/application/usecase/task/updateStatusTask.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const body = await req.json()
  const data = body
  const resolvedParams = await params;
  const { taskId } = resolvedParams;
  const user = JSON.parse(req.headers.get("x-user") ?? "") as {
    email: string,
    role: "user" | "admin",
    id: string
  }
  const UpdateTaskStatusUsecase = await (await GetContainer())
    .resolve<UpdateStatusUsecase>(TYPES.updateTaskStatusUsecase)
    .execute({ data: data, taskId: taskId,userId:user.id });
  return NextResponse.json(
    { message: "Thành công", data: UpdateTaskStatusUsecase },
    { status: 200 },
  );
}