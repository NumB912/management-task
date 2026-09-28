import {
  DeleteSectionUsecase,
  GetSectionByIdUsecase,
  UpdateSectionUsecase,
} from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const resolvedParams = await params;
  const user = JSON.parse(req.headers.get("x-user") ?? "") as {
    email: string;
    role: "user" | "admin";
    id: string;
  };
  const { sectionId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<DeleteSectionUsecase>(TYPES.DeleteSectionUsecase)
    .execute({
      sectionId: sectionId,
      userId: user.id,
    });
  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const resolvedParams = await params;
  const { sectionId } = resolvedParams;
  const getByID = await (await GetContainer())
    .resolve<GetSectionByIdUsecase>(TYPES.GetSectionByIdUsecase)
    .execute({
      sectionId: sectionId,
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
  const user = JSON.parse(req.headers.get("x-user") ?? "") as {
    email: string;
    role: "user" | "admin";
    id: string;
  };
  const resolvedParams = await params;
  const { sectionId } = resolvedParams;
  const data = await req.json();
  const update = await (await GetContainer())
    .resolve<UpdateSectionUsecase>(TYPES.UpdateSectionUsecase)
    .execute(sectionId, user.id, data);

  return NextResponse.json(
    { message: "Thành công", data: update },
    { status: 200 },
  );
}
