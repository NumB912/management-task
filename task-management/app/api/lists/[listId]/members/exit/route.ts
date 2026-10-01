import { ExitMemberUsecase } from "@/app/core/application/usecase/member/exit.usecase";
import { AppError } from "@/app/core/domain";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string;}> },
) {
  try {
    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
      email: string;
      role: "user" | "admin";
      id: string;
    };
    const resolvedParams = await params;
    const { listId } = resolvedParams;
        await (await GetContainer())
      .resolve<ExitMemberUsecase>(TYPES.exitFromList)
      .execute({
        listId: listId,
        email: user.email,
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

    console.error("[DELETE /members/exit] Lỗi không xác định:", error);
    return NextResponse.json(
      { code: "INTERNAL_SERVER", message: "Đã có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
