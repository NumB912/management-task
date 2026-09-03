import { RefreshTokenUseCase } from "@/app/core/application/usecase/user/refresh_token.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/app/core/domain";

export async function POST(request: NextRequest) {
  try {
    const refresh_token = request.cookies.get("refresh_token")?.value;

    if (!refresh_token) {
      return NextResponse.json(
        { message: "Refresh token không tồn tại" },
        { status: 401 }
      );
    }

    const result = await (await GetContainer())
      .resolve<RefreshTokenUseCase>(TYPES.RefreshUsecase)
      .execute(refresh_token);

    const response = NextResponse.json(
      { message: "Làm mới token thành công" },
      { status: 200 }
    );

    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    return response;
  } catch (error) {
    console.error("[RefreshRoute] error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status ?? 401 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Làm mới token thất bại";
    return NextResponse.json({ message }, { status: 401 });
  }
}