import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { CreateListUsecase, GetAllListUsecase } from "@/app/core/application";

export async function GET(req: NextRequest) {
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const lists = await (await GetContainer())
    .resolve<GetAllListUsecase>(TYPES.GetAllListUsecase)
    .execute({
      user_id:user.id
    });
  return NextResponse.json({ lists }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const createList = await (await GetContainer())
    .resolve<CreateListUsecase>(TYPES.CreateListUsecase)
    .execute({
      ...body,
      user:user.id
    });

  return NextResponse.json({ createList }, { status: 200 });
}
