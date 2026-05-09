import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isAdminSession } from "@/lib/auth";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  resource_type?: "image" | "video" | "raw";
  bytes?: number;
  format?: string;
  duration?: number;
  error?: { message?: string };
};

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No media file was provided." }, { status: 400 });
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return NextResponse.json(
      { error: "Only image and video uploads are allowed." },
      { status: 415 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error:
          "This file is larger than 100 MB. Cloudinary free-plan uploads must stay at or below 100 MB.",
        maxBytes: MAX_UPLOAD_BYTES,
      },
      { status: 413 },
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
      { status: 500 },
    );
  }

  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const folder = "newsroom";
  const timestamp = Math.round(Date.now() / 1000).toString();
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("api_key", apiKey);
  cloudinaryForm.append("folder", folder);
  cloudinaryForm.append("timestamp", timestamp);
  cloudinaryForm.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: cloudinaryForm,
    },
  );
  const result = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !result.secure_url) {
    return NextResponse.json(
      {
        error:
          result.error?.message ||
          "Cloudinary rejected the upload. Check your preset and file type.",
      },
      { status: response.status || 502 },
    );
  }

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
    mediaType: resourceType,
    bytes: result.bytes,
    format: result.format,
    duration: result.duration,
  });
}
