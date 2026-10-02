
import { DeleteListUsecase, GetListByIdUsecase, UpdateListUsecase } from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {
      const user = JSON.parse(req.headers.get("x-user") ?? "") as {
      email: string;
      role: "user" | "admin";
      id: string;
    };
  const body = await req.json();
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const { name } = body;
  const updated = await (await GetContainer())
    .resolve<UpdateListUsecase>(TYPES.UpdateListUsecase)
    .execute({
      id:listId,
      name:name,
      userId:user.id
    });
  return NextResponse.json(
    { message: "Thành công trong chỉnh sửa", list: updated },
    { status: 200 },
  );
}

export async function DELETE(req:NextRequest, { params }: { params: Promise<{ listId: string }> }){
        const user = JSON.parse(req.headers.get("x-user") ?? "") as {
      email: string;
      role: "user" | "admin";
      id: string;
    };
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const deleteById = await (await GetContainer())
    .resolve<DeleteListUsecase>(TYPES.DeleteListUsecase)
    .execute({
      id:listId,
      userId:user.id
    });
  return NextResponse.json(
    { message: "Thành công", list: deleteById },
    { status: 200 },
  );
}

export async function GET(req:NextRequest, { params }: { params: Promise<{ listId: string }> }){
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<GetListByIdUsecase>(TYPES.GetListByIdUsecase)
    .execute(listId);

  return NextResponse.json(
    { message: "Thành công", list: getByID },
    { status: 200 },
  );
}
