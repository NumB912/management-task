import { DeleteSectionUsecase, GetSectionByIdUsecase, UpdateSectionUsecase } from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const resolvedParams = await params;
  const { sectionId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<DeleteSectionUsecase>(TYPES.DeleteSectionUsecase)
    .execute({
      section_id: sectionId,
    });
  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sectionId: string}> },
) {
  const resolvedParams = await params;
  const { sectionId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<GetSectionByIdUsecase>(TYPES.GetSectionByIdUsecase)
    .execute({
      sectionId: sectionId
    });

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const resolvedParams = await params;
  const { sectionId } = resolvedParams;
  const data = await req.json();
  const update = await (await GetContainer())
    .resolve<UpdateSectionUsecase>(TYPES.UpdateSectionUsecase)
    .execute(sectionId, data);

  return NextResponse.json(
    { message: "Thành công", data: update },
    { status: 200 },
  );
}
