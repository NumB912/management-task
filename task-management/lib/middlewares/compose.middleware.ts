import { NextRequest, NextResponse } from "next/server";
import {  middlewareFn } from "./types.middleware";

export function compose(steps: middlewareFn[]) {
  return async (req: NextRequest): Promise<NextResponse> => {
    for (const step of steps) {
      const result = await step(req);
      if (result) return result; 
    }
    return NextResponse.next({ request: { headers: req.headers } });
  };
}