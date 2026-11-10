import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "rose_foundation_admin";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "development-admin-session-secret-32-chars";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = String(expiresAt);
  return {
    token: `${payload}.${sign(payload)}`,
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));

  if (!cookie) return false;

  const token = decodeURIComponent(cookie.slice(ADMIN_COOKIE_NAME.length + 1));
  const [expiresAt, signature, extra] = token.split(".");
  if (!expiresAt || !signature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(sign(expiresAt), "hex");
  const actual = Buffer.from(signature, "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function verifyAdminCode(code: unknown) {
  const configuredCode = process.env.ADMIN_ACCESS_CODE ?? "rosecare";
  if (typeof code !== "string") return false;

  const actual = Buffer.from(code);
  const expected = Buffer.from(configuredCode);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function adminCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
