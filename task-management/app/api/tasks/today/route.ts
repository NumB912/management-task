import { GetTodayUsecase } from "@/app/core/application/usecase/task/today.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
) {

    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
        email: string,
        role: "user" | "admin",
        id: string
    }
    const getToday = await (await GetContainer())
        .resolve<GetTodayUsecase>(TYPES.GetTodayUsecase)
        .execute({
            user_id: user.id
        });

    return NextResponse.json(
        { message: "Thành công", getToday},
        { status: 200 },
    );
}
