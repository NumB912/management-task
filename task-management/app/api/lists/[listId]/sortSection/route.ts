import { SortSectionUsecase } from "@/app/core/application/usecase/list/sortSection.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {

  const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const body = await req.json();
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const { fromId,toId } = body;
  const updated = await (await GetContainer())
    .resolve<SortSectionUsecase>(TYPES.SortSectionUsecase)
    .execute({
      listId:listId,
      endSectionId:toId,
      startSectionId:fromId,
      userId:user.id
    });
  return NextResponse.json(
    { message: "Thành công trong chỉnh sửa", list: updated },
    { status: 200 },
  );
}
