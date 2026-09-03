import { ChangePasswordUsecase } from "@/app/core/application/usecase/user/changePassword.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/app/core/domain";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email và mật khẩu mới là bắt buộc" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "Mật khẩu phải có ít nhất 8 ký tự" },
        { status: 400 }
      );
    }

    await (await GetContainer())
      .resolve<ChangePasswordUsecase>(TYPES.ResetPasswordUsecase)
      .execute({
        email,
        password,
      });

    return NextResponse.json(
      { message: "Đặt lại mật khẩu thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ResetPasswordRoute] error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status ?? 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại";
    return NextResponse.json({ message }, { status: 500 });
  }
}