import { NextResponse } from "next/server";
import { createAdminSession, validateAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const session =
      email && password ? await validateAdminCredentials(email, password) : null;

    if (!session) {
      return NextResponse.json(
        { error: "Invalid admin email/password, or the account is not approved yet." },
        { status: 401 },
      );
    }

    await createAdminSession(session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Admin login could not be completed.",
      },
      { status: 500 },
    );
  }
}
