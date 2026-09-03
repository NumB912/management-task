import { CreateFilterUsecase, GetAllFiltersUsecase } from "@/app/core/application";
import { IFilterWithId } from "@/app/core/domain";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json()
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const data = body 
  const createFilter = await (await GetContainer())
    .resolve<CreateFilterUsecase>(TYPES.CreateFilterUsecase)
    .execute(
      {
        data:data,
        user_id:user.id
      }
    );
  return NextResponse.json({ tag: createFilter }, { status: 200 });
}

export async function GET(req: NextRequest) {
   const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const data = await (await GetContainer())
    .resolve<GetAllFiltersUsecase>(TYPES.GetAllFilterUsecase)
    .execute(user.id);

  return NextResponse.json({ projects: { data } }, { status: 200 });
}
