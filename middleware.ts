import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Placeholder: you can add authentication, logging, etc. here later
  return NextResponse.next();
}
