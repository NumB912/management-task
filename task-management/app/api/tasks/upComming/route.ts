
import { GetUpcomingUsecase } from "@/app/core/application/usecase/task/upComming.usecase";
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
    const data = await (await GetContainer())
        .resolve<GetUpcomingUsecase>(TYPES.GetUpcomingUsecase)
        .execute({
            user_id: user.id
        });

    return NextResponse.json(
        { message: "Thành công", ...data},
        { status: 200 },
    );
}
