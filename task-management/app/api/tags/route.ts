
import { CreateTagUsecase } from "@/app/core/application";
import { GetAllTagsUsecase } from "@/app/core/application/usecase/tag/getAllTag.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = JSON.parse(req.headers.get("x-user") ?? "") as {
    email: string,
    role: "user" | "admin",
    id: string
  }
  const data = await (await GetContainer())
    .resolve<GetAllTagsUsecase>(TYPES.GetAllTagUsecase)
    .execute(user.id);
  return NextResponse.json({ tags: { data } }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = JSON.parse(req.headers.get("x-user") ?? "") as {
    email: string,
    role: "user" | "admin",
    id: string
  }
  const { name } = body
  const createTag = await (await GetContainer())
    .resolve<CreateTagUsecase>(TYPES.CreateTagUsecase)
    .execute({
      name: name,
      userId: user?.id
    });

  return NextResponse.json({ tag: createTag }, { status: 200 });
}
