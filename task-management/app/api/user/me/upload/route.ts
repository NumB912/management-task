import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/app/core/infrastructure/container/type.container";
import { GetContainer } from "@/app/core/infrastructure/container/container";
import { GetProfileUsecase } from "@/app/core/application/usecase/user/getProfile.usecase";
import { AppError } from "@/app/core/domain";
import { PutProfileUsecase } from "@/app/core/application/usecase/user/profileupdate.usecase";

export async function POST(req: NextRequest) {
    try{
         const user = JSON.parse(req.headers.get("x-user") ?? "") as {
        email: string,
        role: "user" | "admin",
        id: string
    }

    const data =await req.json()
    await (await GetContainer())
        .resolve<>(TYPES.uploadFIle)
        .execute({
            userId: user.id,
            data:data
        });
    return NextResponse.json({ user: { ...data } }, { status: 200 });
    }catch(error){
   if (error instanceof AppError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status },
      );
    }

    console.error("[POST /members/invite] Lỗi không xác định:", error);
    return NextResponse.json(
      { code: "INTERNAL_SERVER", message: "Đã có lỗi xảy ra" },
      { status: 500 },
    );
}
}

export async function DELETE(req: NextRequest) {
    try{
         const user = JSON.parse(req.headers.get("x-user") ?? "") as {
        email: string,
        role: "user" | "admin",
        id: string
    }

    const data =await req.json()
    await (await GetContainer())
        .resolve<PutProfileUsecase>(TYPES.putProfileUsecase)
        .execute({
            userId: user.id,
            data:data
        });
    return NextResponse.json({ user: { ...data } }, { status: 200 });
    }catch(error){
   if (error instanceof AppError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status },
      );
    }

    console.error("[POST /members/invite] Lỗi không xác định:", error);
    return NextResponse.json(
      { code: "INTERNAL_SERVER", message: "Đã có lỗi xảy ra" },
      { status: 500 },
    );
}
}

