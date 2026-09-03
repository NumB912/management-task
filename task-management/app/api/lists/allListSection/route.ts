import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { GetAllListSectionUsecase } from "@/app/core/application/usecase/list/getListSection.usecase";

export async function GET(req: NextRequest) {
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }

  const lists = await (await GetContainer())
    .resolve<GetAllListSectionUsecase>(TYPES.GetAllListSectionUsecase
    )
    .execute({
      user_id:user.id
    });
  return NextResponse.json({ lists }, { status: 200 });
}
