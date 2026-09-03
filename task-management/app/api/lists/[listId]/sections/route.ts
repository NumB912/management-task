
import { CreateSectionUsecase, GetAllSectionUsecase } from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const getByID = await (await GetContainer())
    .resolve<GetAllSectionUsecase>(TYPES.GetAllSectionUsecase)
    .execute(listId,user.id);

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {
  const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const body = await req.json();
  const { name } = body;
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<CreateSectionUsecase>(TYPES.CreateSectionUsecase)
    .execute({
      data: {
        name: name
      },
      user_id:user.id,
      list_id: listId
    });

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}
