import { SearchMemberUsecase } from "@/app/core/application/usecase/member/searchMember.usecase";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const xUserHeader = req.headers.get("x-user");
    if (!xUserHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing user info" }, { status: 401 });
    }
    const user = JSON.parse(xUserHeader) as {
      email: string;
      role: "user" | "admin";
      id: string;
    };
    const { listId } = await params;
    const query = req.nextUrl.searchParams.get("search") ?? "";
    const container = await GetContainer();
    const data = await container
      .resolve<SearchMemberUsecase>(TYPES.SearchMemberUsecase)
      .execute({
        listId:listId,
        search:query
      });
    return NextResponse.json({ projects: { data } }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}