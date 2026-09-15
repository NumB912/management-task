import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { CreatePromodoUsecase } from "@/app/core/application";
import { GetPromodoUsecase } from "@/app/core/application/usecase/promodo/getPromodo.usecase";

export async function POST(req: NextRequest) {
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const body =await req.json()
  const data = await (await GetContainer())
    .resolve<CreatePromodoUsecase>(TYPES.createPromodoUsecase)
    .execute(
      body,
      user.id
    );
  return NextResponse.json({ data }, { status: 200 });
}

export async function GET(req: NextRequest) {
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const data = await (await GetContainer())
    .resolve<GetPromodoUsecase>(TYPES.getPromodoUsecase)
    .execute(
      user.id
    );
  return NextResponse.json({ data }, { status: 200 });
}
