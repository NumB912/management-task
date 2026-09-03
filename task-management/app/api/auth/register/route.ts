import { RegisterEmailUsecase } from "@/app/core/application/usecase/user/register.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/app/core/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, name } = body;
    const registerToken = request.cookies.get("register_token")?.value;

    if (!registerToken) {
      return NextResponse.json(
        { message: "Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại." },
        { status: 400 }
      );
    }
    let email: string;
    try {
      const payload = JSON.parse(Buffer.from(registerToken.split(".")[1], "base64").toString());
      email = payload.email;
      if (!email) throw new Error("No email in token");
    } catch {
      return NextResponse.json(
        { message: "Token không hợp lệ. Vui lòng đăng ký lại." },
        { status: 400 }
      );
    }

    if (!name || !password) {
      return NextResponse.json(
        { message: "Thiếu thông tin đăng ký" },
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
      .resolve<RegisterEmailUsecase>(TYPES.RegisterEmailUsecase)
      .execute({
        email,
        name,
        password,
      });

    const response = NextResponse.json(
      { message: "Đăng ký thành công" },
      { status: 200 }
    );

    response.cookies.delete("register_token");

    return response;
  } catch (error) {
    console.error("[RegisterRoute] error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status ?? 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Đăng ký thất bại";
    return NextResponse.json({ message }, { status: 500 });
  }
}