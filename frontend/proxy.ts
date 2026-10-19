import { NextRequest, NextResponse } from "next/server";

import { URLPattern } from "urlpattern-polyfill";
export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};