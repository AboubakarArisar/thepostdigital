import { NextResponse } from "next/server";
import { changeAdminPassword, getAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Admin login required." }, { status: 401 });
    }

    const { currentPassword, newPassword } = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    await changeAdminPassword({
      email: session.email,
      currentPassword: currentPassword || "",
      newPassword: newPassword || "",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Password could not be changed.",
      },
      { status: 400 },
    );
  }
}
