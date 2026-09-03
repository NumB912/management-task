import { NextRequest, NextResponse } from "next/server";
import { compose } from "./lib/middlewares/compose.middleware";
import { routes } from "./lib/middlewares/route.middleware";
import { URLPattern } from "urlpattern-polyfill";
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
 for (const route of routes) {
    const pattern =new URLPattern({ pathname: route.matcher });
    const match = pattern.exec({ pathname });
    if (match) {
      const headers = new Headers(request.headers);
      headers.set("x-params",JSON.stringify(match.pathname.groups))
      const newRequest = new NextRequest(request, { headers });
      return (await compose(route.chain)(newRequest)) ?? NextResponse.next({ request: { headers } });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};