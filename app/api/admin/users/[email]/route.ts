import { NextResponse } from "next/server";
import { getAdminSession, isSuperAdmin, verifyAdminAccount } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ email: string }> },
) {
  const session = await getAdminSession();

  if (!session || !isSuperAdmin(session)) {
    return NextResponse.json(
      { error: "Only the super admin can verify admin accounts." },
      { status: 403 },
    );
  }

  const { email } = await params;
  const { status } = (await request.json()) as {
    status?: "approved" | "rejected";
  };

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "Account status must be approved or rejected." },
      { status: 400 },
    );
  }

  try {
    const user = await verifyAdminAccount(
      decodeURIComponent(email),
      status,
      session.email,
    );

    if (!user) {
      return NextResponse.json({ error: "Admin account was not found." }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      status: user.status,
      role: user.role,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Admin account could not be updated.",
      },
      { status: 409 },
    );
  }
}
