import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { GetProfileUsecase } from "@/app/core/application/usecase/user/getProfile.usecase";

export async function GET(req: NextRequest) {
    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
        email: string,
        role: "user" | "admin",
        id: string
    }
    const data = await (await GetContainer())
        .resolve<GetProfileUsecase>(TYPES.GetProfileUsecase)
        .execute({
            userId: user.id
        });
    return NextResponse.json({ user: { ...data } }, { status: 200 });
}
