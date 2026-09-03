import { SendChangePasswordUsecase } from "@/app/core/application/usecase/user/sendChangePassword.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/app/core/domain";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email là bắt buộc" },
        { status: 400 }
      );
    }

    await (await GetContainer())
      .resolve<SendChangePasswordUsecase>(TYPES.SendResetPasswordUsecase)
      .execute(email);

    return NextResponse.json(
      { message: "Đã {} đặt lại mật khẩu về email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SendResetPasswordRoute] error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status ?? 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Không thể gửi email đặt lại mật khẩu";
    return NextResponse.json({ message }, { status: 500 });
  }
}