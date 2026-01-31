export const runtime = "nodejs";

import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

cloudinary.config({
  secure: true,
});

// Upload image buffer + run OCR (Cloudinary add-on)
function uploadBufferToCloudinary(buffer: Buffer) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "handwriting_ocr",
        resource_type: "image",
        // Cloudinary OCR add-on:
        ocr: "adv_ocr:document",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    // ✅ Supabase auth (RLS-safe)
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FormData expected: file + optional title/course/topic
    const formData = await request.formData();
    const file = formData.get("file");
    const title = (formData.get("title") as string) || "";
    const course = (formData.get("course") as string) || "";
    const topic = (formData.get("topic") as string) || "";

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Basic validation: only images
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: "Only images are allowed for handwriting OCR" },
        { status: 400 },
      );
    }

    // ✅ Limit file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "File size must be under 5MB" },
        { status: 400 },
      );
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload + OCR
    const result = await uploadBufferToCloudinary(buffer);

    // Extract text
    const ocrRoot = result?.info?.ocr?.["adv_ocr:document"];
    const ocrData = ocrRoot?.data?.[0];

    const text: string =
      ocrData?.fullTextAnnotation?.text ||
      ocrData?.textAnnotations?.[0]?.description ||
      "";

    return Response.json({
      success: true,
      text,
      file_url: result?.secure_url ?? null,
      meta: { title, course, topic },
      // keep ocr if you want to debug; remove in production if too large
      ocr: result?.info?.ocr ?? null,
    });
  } catch (err: any) {
    console.error("HANDWRITING OCR ERROR:", err);
    return Response.json(
      { error: err?.message ?? "OCR failed" },
      { status: 500 },
    );
  }
}
