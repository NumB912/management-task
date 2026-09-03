

import { GetTagByIdUsecase } from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tagId: string }> },
) {

  const userHeader = req.headers.get("x-user") ?? ""
  if (!userHeader) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const getParam = await params
  const { tagId } = getParam
  const user = JSON.parse(userHeader) as { 
    email: string,
    role: "user" | "admin",
    id: string
  }
  const getTagById = await (await GetContainer())
    .resolve<GetTagByIdUsecase>(TYPES.GetTagByIdUsecase)
    .execute({
      id: tagId,
      userId: user.id
    });

  return NextResponse.json(
    { message: "Thành công", ...getTagById },
    { status: 200 },
  );
}
