import { SendOtpUsecase } from "@/app/core/application";
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

    const emailResponse =  await (await GetContainer())
      .resolve<SendOtpUsecase>(TYPES.SendOtpUsecase)
      .execute(email);

    return NextResponse.json(
      { message: "Gửi mã xác thực thành công",email:emailResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SendOtpRoute] error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status ?? 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Không thể gửi mã xác thực";
    return NextResponse.json({ message }, { status: 500 });
  }
}