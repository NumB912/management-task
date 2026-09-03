
import { DeleteListUsecase, GetListByIdUsecase, UpdateListUsecase } from "@/app/core/application";
import { SortSectionUsecase } from "@/app/core/application/usecase/list/sortSection.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {
  const body = await req.json();
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const { name } = body;
  const updated = await (await GetContainer())
    .resolve<UpdateListUsecase>(TYPES.UpdateListUsecase)
    .execute(listId, name);
  return NextResponse.json(
    { message: "Thành công trong chỉnh sửa", list: updated },
    { status: 200 },
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> },
) {
  const body = await req.json();
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const { fromId,toId } = body;
  const updated = await (await GetContainer())
    .resolve<SortSectionUsecase>(TYPES.SortSectionUsecase)
    .execute({
      listId:listId,
      endSectionId:toId,
      startSectionId:fromId
    });
  return NextResponse.json(
    { message: "Thành công trong chỉnh sửa", list: updated },
    { status: 200 },
  );
}

export async function DELETE(req:NextRequest, { params }: { params: Promise<{ listId: string }> }){
  const resolvedParams = await params;
  const { listId } = resolvedParams;
  const deleteById = await (await GetContainer())
    .resolve<DeleteListUsecase>(TYPES.DeleteListUsecase)
    .execute(listId);

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
