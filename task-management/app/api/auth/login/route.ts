
import { LoginWithEmailUseCase } from "@/app/core/application/usecase/user/login.usecase";
import { Container } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    const { token, refresh_token } = await (await Container.getInstance())
      .resolve<LoginWithEmailUseCase>(TYPES.LoginWithEmailUseCase)
      .execute({ email, password });
    const response = NextResponse.json(
      { message: "Đăng nhập thành công" },
      { status: 200 }
    );

    response.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    return response;
  } catch (err) {
    console.error("[LoginRoute] error:", err);
    const message =
      err instanceof Error ? err.message : "Đăng nhập thất bại";
    return NextResponse.json({ message }, { status: 401 });
  }
}