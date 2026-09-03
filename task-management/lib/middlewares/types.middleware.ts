import { NextRequest, NextResponse } from "next/server";

export type middlewareFn = (
  req: NextRequest,
 ...args: any[]
) => NextResponse | null | Promise<NextResponse | null>;
export type fn = (req:Request)=>void

export type Route = {
  matcher:string,
  chain:middlewareFn[]
}