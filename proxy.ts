import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "post_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;
const DEFAULT_SESSION_SECRET = "dev-only-newsclient-admin-secret";

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET === DEFAULT_SESSION_SECRET)
) {
  throw new Error(
    "ADMIN_SESSION_SECRET must be set to a non-default value in production.",
  );
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
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

// Compare in constant time so a signature cannot be recovered by timing the
// response. lib/auth.ts uses timingSafeEqual for the same check; the Edge
// runtime has no node:crypto, so this is the equivalent.
function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

type ProxySession = { email: string; role: "admin" | "super_admin" };

async function readAdminSession(
  request: NextRequest,
): Promise<ProxySession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [email, role, issuedAt, signature] = token.split("|");

  if (!email || !role || !issuedAt || !signature) return null;
  if (role !== "super_admin" && role !== "admin") return null;

  const issuedAtMs = Number(issuedAt);
  if (!Number.isFinite(issuedAtMs) || Date.now() - issuedAtMs > SESSION_MAX_AGE * 1000) {
    return null;
  }

  if (!safeEqual(signature, await sign(`${email}|${role}|${issuedAt}`))) {
    return null;
  }

  return { email, role };
}

function isProtectedApi(pathname: string) {
  return (
    pathname.startsWith("/api/articles") ||
    pathname.startsWith("/api/cloudinary-upload") ||
    pathname.startsWith("/api/cloudinary-sign") ||
    pathname.startsWith("/api/admin/users") ||
    pathname.startsWith("/api/admin/logout")
  );
}

// Areas only the super admin may reach. Enforced here so a new page under one
// of these prefixes is gated the moment it exists, rather than relying on
// whoever writes it to remember the role check.
function isSuperAdminOnly(pathname: string) {
  return (
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/access") ||
    pathname.startsWith("/api/admin/users")
  );
}

// The reader-facing pages. A signed-in admin is sent back to the newsroom from
// these, so an editorial session never wanders around the public site.
function isPublicPage(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/search" ||
    pathname.startsWith("/article/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isLoginPage;
  const isProtected = isAdminPage || isProtectedApi(pathname);
  const isApi = pathname.startsWith("/api");

  if (!isProtected) {
    // readAdminSession returns immediately when there is no cookie, so an
    // anonymous reader pays a cookie lookup and nothing more.
    if (isPublicPage(pathname) && (await readAdminSession(request))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  const session = await readAdminSession(request);

  if (!session) {
    return isApi
      ? NextResponse.json({ error: "Admin login required." }, { status: 401 })
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Signed in, but not allowed in this part of the newsroom.
  if (session.role !== "super_admin" && isSuperAdminOnly(pathname)) {
    return isApi
      ? NextResponse.json(
          { error: "Super admin access required." },
          { status: 403 },
        )
      : NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/contact",
    "/search",
    "/article/:path*",
    "/admin/:path*",
    "/api/articles/:path*",
    "/api/cloudinary-upload",
    "/api/cloudinary-sign",
    "/api/admin/users/:path*",
    "/api/admin/logout",
  ],
};
