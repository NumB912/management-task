
import { ChangePositionSectionUsecase } from "@/app/core/application/usecase/section/changeOrderSection.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sectionId: string }> },) {
  const data = await req.json();

  const { sectionId } = await params
  const { orderChangeId } = data;

  const update = await (await GetContainer())
    .resolve<ChangePositionSectionUsecase>(TYPES.ChangePositionSectionUsecase)
    .execute(sectionId, orderChangeId);

  return NextResponse.json(
    { message: "Thành công", data: update },
    { status: 200 },
  );
}