import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const tenant = request.cookies.get("tenant_id")?.value || "demo-tenant";
  const response = NextResponse.next();
  response.headers.set("x-tenant-id", tenant);
  return response;
}

export const config = {
  matcher: ["/trader/:path*", "/admin/:path*"]
};

