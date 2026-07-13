import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isAdminSession } from "@/lib/auth";

// Returns a short-lived signature so the browser can upload the file DIRECTLY
// to Cloudinary. The file bytes never pass through this serverless function,
// which is what avoids Vercel's 4.5 MB request-body limit
// (FUNCTION_PAYLOAD_TOO_LARGE) on the old proxied upload.
export async function POST() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel project environment variables, then redeploy.",
      },
      { status: 500 },
    );
  }

  const folder = "newsroom";
  const timestamp = Math.round(Date.now() / 1000).toString();
  // Signed params must be sorted alphabetically: folder, then timestamp.
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature,
  });
}
