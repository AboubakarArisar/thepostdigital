import { NextResponse } from "next/server";
import { createPendingAdminAccount } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, name, password } = (await request.json()) as {
    email?: string;
    name?: string;
    password?: string;
  };

  try {
    const account = await createPendingAdminAccount({
      email: email || "",
      name: name || "",
      password: password || "",
    });

    return NextResponse.json(
      {
        email: account.email,
        status: account.status,
        message: "Signup received. The super admin must approve this account.",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Admin signup could not be saved.",
      },
      { status: 400 },
    );
  }
}
