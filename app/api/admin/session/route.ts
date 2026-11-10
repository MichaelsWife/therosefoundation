import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminCookieOptions, createAdminSession, isAdminRequest, verifyAdminCode } from "@/lib/admin-auth";

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: isAdminRequest(request) });
}

export async function POST(request: Request) {
  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!verifyAdminCode(body.code)) {
    return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
  }

  const session = createAdminSession();
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE_NAME, session.token, adminCookieOptions(session.maxAge));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE_NAME, "", adminCookieOptions(0));
  return response;
}
