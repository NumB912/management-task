import { ChangeRoleUsecase } from "@/app/core/application/usecase/member/changeRole.usecase";
import { DeleteMemberUsecase } from "@/app/core/application/usecase/member/deleteMember.usecase";
import { InviteMemberUsecase } from "@/app/core/application/usecase/member/inviteMember.usecase";
import { IRole } from "@/app/core/domain/entities/member.entities";
import { AppError } from "@/app/core/domain";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string; email: string }> },
) {
  try {
    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
      email: string;
      role: "user" | "admin";
      id: string;
    };
    const resolvedParams = await params;
    const { listId, email } = resolvedParams;

    const result = await (await GetContainer())
      .resolve<DeleteMemberUsecase>(TYPES.DeleteMemberUsecase)
      .execute({
        listId: listId,
        email: email,
        userId: user.id,
      });

    return NextResponse.json(
      { message: "Thành công", success:true },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status },
      );
    }

    console.error("[DELETE /members] Lỗi không xác định:", error);
    return NextResponse.json(
      { code: "INTERNAL_SERVER", message: "Đã có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string; email: string }> },
) {
  try {
    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
      email: string;
      role: "user" | "admin";
      id: string;
    };
    const body = await req.json();
    const { role } = body as { role: IRole };
    const resolvedParams = await params;
    const { listId, email } = resolvedParams;

    const result = await (await GetContainer())
      .resolve<ChangeRoleUsecase>(TYPES.ChangeRoleUsecase)
      .execute({
        listId: listId,
        email: email,
        role: role,
      });

    return NextResponse.json(
      { message: "Thành công", data: result },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status },
      );
    }

    console.error("[PATCH /members] Lỗi không xác định:", error);
    return NextResponse.json(
      { code: "INTERNAL_SERVER", message: "Đã có lỗi xảy ra" },
      { status: 500 },
    );
  }
}