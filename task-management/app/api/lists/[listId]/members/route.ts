import { InviteMemberUsecase } from "@/app/core/application/usecase/member/inviteMember.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {
  const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const body = await req.json();
  const { members } = body;
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<InviteMemberUsecase>(TYPES.InviteMemberUsecase)
    .execute({
        data:members,
        listId:listId,
        userId:user.id
    });

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}


