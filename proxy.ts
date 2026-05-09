import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "post_admin_session";

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-only-newsclient-admin-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return bytesToHex(signature);
}

async function hasValidAdminSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const [email, role, issuedAt, signature] = token.split("|");

  if (!email || !role || !issuedAt || !signature) return false;
  if (role !== "super_admin" && role !== "admin") return false;

  return signature === (await sign(`${email}|${role}|${issuedAt}`));
}

function isProtectedApi(pathname: string) {
  return (
    pathname.startsWith("/api/articles") ||
    pathname.startsWith("/api/cloudinary-upload") ||
    pathname.startsWith("/api/admin/users") ||
    pathname.startsWith("/api/admin/logout")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isLoginPage;
  const isProtected = isAdminPage || isProtectedApi(pathname);

  if (!isProtected && !isLoginPage) {
    return NextResponse.next();
  }

  const isAuthed = await hasValidAdminSession(request);

  if (isLoginPage && isAuthed) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!isAuthed && pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  if (!isAuthed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/articles/:path*",
    "/api/cloudinary-upload",
    "/api/admin/users/:path*",
    "/api/admin/logout",
  ],
};
