
import { DeleteFilterUsecase, GetFilterByIdUsecase, UpdateFilterUsecase } from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filterId: string }> },
) {
     const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const resolvedParams = await params;
  const { filterId } = resolvedParams;
  const data = await (await GetContainer())
    .resolve<GetFilterByIdUsecase>(TYPES.GetFilterByIdUsecase)
    .execute({
      id:filterId,
      userId:user.id
    });

  return NextResponse.json({...data}, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ filterId: string }> }
) {
  const resolvedParams = await params;
  const { filterId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<DeleteFilterUsecase>(TYPES.DeleteFilterUsecase)
    .execute(filterId);

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ filterId: string }> }
) {
  const body = await req.json()
  const resolvedParams = await params;
  const { filterId } = resolvedParams;
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const getByID = await (await GetContainer())
    .resolve<UpdateFilterUsecase>(TYPES.UpdateFilterUsecase)
    .execute({
      data:body,
      id:filterId,
      user_id:user.id
    });

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}


