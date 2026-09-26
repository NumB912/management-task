import { StatusInviteUsecase } from "@/app/core/application/usecase/member/statusInvite.usecase"
import { IStatusMember } from "@/app/core/domain"
import { GetContainer } from "@/app/core/infrastructure/container/container"
import { TYPES } from "@/app/core/infrastructure/container/type.container"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string}> },
) {
  const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const body = await req.json()
  const {status} =body as {
    status:IStatusMember
  }
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<StatusInviteUsecase>(TYPES.StatusInviteUsecase)
    .execute({
        listId:listId,
        email:user.email,
        status:status,
        userId:user.id
    });

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}
