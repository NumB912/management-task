import { ConfirmOtpUsecase } from "@/app/core/application/usecase/user/confirm_otp.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/app/core/domain";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email và mã OTP là bắt buộc" },
        { status: 400 }
      );
    }

    if (typeof otp !== "string" || otp.length !== 6) {
      return NextResponse.json(
        { message: "Mã OTP phải là 6 chữ số" },
        { status: 400 }
      );
    }

    const token = await (await GetContainer())
      .resolve<ConfirmOtpUsecase>(TYPES.ConfirmOtpUsecase)
      .execute(email, otp);

    const response = NextResponse.json(
      { message: "Xác thực thành công" },
      { status: 200 }
    );

    response.cookies.set("register_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 7,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("[ConfirmOtpRoute] error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status ?? 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Xác thực thất bại";
    return NextResponse.json({ message }, { status: 401 });
  }
}