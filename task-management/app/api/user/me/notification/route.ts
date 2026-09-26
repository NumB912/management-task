import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { GetNotificationsUsecase } from "@/app/core/application/usecase/notification/getNotification.usecase";
import { ReadedNotificationUsecase } from "@/app/core/application/usecase/notification/readNotification.usecase";

export async function GET(req: NextRequest) {
    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
        email: string,
        role: "user" | "admin",
        id: string
    }
    const data = await (await GetContainer())
        .resolve<GetNotificationsUsecase>(TYPES.getNotification)
        .execute(user.id);
    return NextResponse.json({ notification: data }, { status: 200 });
}

export async function PATCH(req:NextRequest){
    const user = JSON.parse(req.headers.get("x-user") ?? "") as {
        email: string,
        role: "user" | "admin",
        id: string
    }
    const data = await (await GetContainer())
        .resolve<ReadedNotificationUsecase>(TYPES.readNotification)
        .execute(user.id);
    return NextResponse.json({ success: data }, { status: 200 });
}