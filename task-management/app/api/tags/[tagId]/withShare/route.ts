
import { DeleteTagWithShareUsecase, UpdateTagUsecase } from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: {params: Promise<{ tagId: string }> },
) {
  const resolvedParams = await params;
  const { tagId } = resolvedParams;
  const userHeader = req.headers.get("x-user") ?? ""
  if (!userHeader) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 } 
    );
  }

  const user = JSON.parse(userHeader) as {
    email: string,
    role: "user" | "admin",
    id: string
  }
  const container = await GetContainer()
  const getByID = await container
    .resolve<DeleteTagWithShareUsecase>(TYPES.DeleteTagUsecase)
    .execute({
      id: tagId,
      userId: user.id,
    });

  return NextResponse.json(
    { message: "Thành công", data: getByID },
    { status: 200 },
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tagId: string }> },
) {
  const body = await req.json();
  const userHeader = req.headers.get("x-user") ?? ""
  if (!userHeader) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const getParam = await params
  const {tagId} = getParam
  const user = JSON.parse(userHeader) as {
    email: string,
    role: "user" | "admin",
    id: string
  }
  const {name} = body as {name:string,isShare:boolean}
  const updated = await (await GetContainer())
    .resolve<UpdateTagUsecase>(TYPES.UpdateTagUsecase)
    .execute({
      id:tagId,
      name:name,
      userId: user.id,
    });
  return NextResponse.json(
    { message: "Thành công trong chỉnh sửa", data: updated },
    { status: 200 },
  );
}