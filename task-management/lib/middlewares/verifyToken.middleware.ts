import { NextRequest, NextResponse } from "next/server";
import { middlewareFn } from "./types.middleware";
import { jwtVerify } from "jose";
export const verifyToken =async (nameToken: string="token",nameHeader:string="x-user"): Promise<middlewareFn> => {
  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get(nameToken)?.value
      if (!token) {
        return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
      }

      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SECRET_KEY)
      );
      req.headers.set(nameHeader, JSON.stringify(payload))
      return null;
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: "Lỗi" }, { status: 500 })
    }
  }
}