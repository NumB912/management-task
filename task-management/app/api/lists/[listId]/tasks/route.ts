import { CreateTaskUsecase } from "@/app/core/application";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string; }> },
) {
    const user =JSON.parse(req.headers.get("x-user")??"") as {
    email:string,
    role:"user"|"admin",
    id:string
  }
  const { listId } = await params;
  const task = await req.json();
  const createList = await (await GetContainer())
    .resolve<CreateTaskUsecase>(TYPES.CreateTaskUsecase)
    .execute({
      data:task,
      listId:listId,
      userId:user.id
    });
  return NextResponse.json({ createList }, { status: 200 });
}

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ sectionId: string, listId: string; }> },
// ) {
//   const resolvedParams = await params;
//   const { sectionId,listId } = resolvedParams;
//   const getByID = await (await GetContainer())
//     .resolve<GetAllTasksUsecase>(TYPES.GetAllTaskUsecase)
//     .execute({
//       section:sectionId,
//       list:listId
//     });

//   return NextResponse.json(
//     { message: "Thành công", data: getByID },
//     { status: 200 },
//   );
// }
