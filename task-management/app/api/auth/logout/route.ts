import { RefreshTokenUseCase } from "@/app/core/application/usecase/user/refresh_token.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/app/core/domain";
import { LogoutUseCase } from "@/app/core/application/usecase/user/logout.usecase";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token || !token && typeof token == "string") {
      return NextResponse.json(
        { message: "token không tồn tại" },
        { status: 401 },
      );
    }

    await (await GetContainer())
      .resolve<LogoutUseCase>(TYPES.RefreshUsecase)
      .execute({
        token: token,
      });

    const response = NextResponse.json(
      { message: "Làm mới token thành công" },
      { status: 200 },
    );
    return response;
  } catch (error) {
    console.error("[RefreshRoute] error:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status ?? 401 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Làm mới token thất bại";
    return NextResponse.json({ message }, { status: 401 });
  } finally {
    const response = NextResponse.json(
      { message: "Làm mới token thành công" },
      { status: 200 },
    );
    response.cookies.delete("token");
    response.cookies.delete("refresh_token");
    return response
  }
}
