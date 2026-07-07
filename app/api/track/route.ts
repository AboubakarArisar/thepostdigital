import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/analytics";

const VISITOR_COOKIE = "post_visitor_id";
// Remember a visitor for a year so repeat sessions are not counted as unique.
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST() {
  const cookieStore = await cookies();
  const isNewVisitor = !cookieStore.get(VISITOR_COOKIE)?.value;

  if (isNewVisitor) {
    cookieStore.set(VISITOR_COOKIE, randomBytes(16).toString("hex"), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: VISITOR_MAX_AGE,
      path: "/",
    });
  }

  try {
    await recordVisit({ isNewVisitor });
  } catch {
    // Analytics is best-effort; never fail a page load because of it.
  }

  return NextResponse.json({ ok: true });
}
