import { ChangeRoleUsecase } from "@/app/core/application/usecase/member/changeRole.usecase";
import { DeleteMemberUsecase } from "@/app/core/application/usecase/member/deleteMember.usecase";
import { InviteMemberUsecase } from "@/app/core/application/usecase/member/inviteMember.usecase";
import { IRole } from "@/app/core/domain/entities/member.entities";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string,email:string }> },
) {
  const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const resolvedParams = await params;
  const { listId,email } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<DeleteMemberUsecase>(TYPES.DeleteMemberUsecase)
    .execute({
        listId:listId,
        email:email,
        userId:user.id
    });

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string,email:string }> },
) {
  const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const body = await req.json()
  const {role} =body as {
    role:IRole
  }
  const resolvedParams = await params;
  const { listId,email } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<ChangeRoleUsecase>(TYPES.ChangeRoleUsecase)
    .execute({
        listId:listId,
        email:email,
        role:role
    });

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}
