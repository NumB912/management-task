import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { GetInboxUsecase } from "@/app/core/application/usecase/list/getInbox.usecase";

export async function GET(req: NextRequest) {
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const data = await (await GetContainer())
    .resolve<GetInboxUsecase>(TYPES.GetInboxUsecase)
    .execute({
      user_id:user.id
    });
  return NextResponse.json({data }, { status: 200 });
}
