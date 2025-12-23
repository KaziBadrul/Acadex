export const runtime = "nodejs";

import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function uploadBufferToCloudinary(buffer: Buffer) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "handwriting_ocr",
        resource_type: "image",
        ocr: "adv_ocr:document",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
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
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = (formData.get("title") as string) || "Scanned note";
    const course = (formData.get("course") as string) || null;
    const topic = (formData.get("topic") as string) || null;

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload + OCR
    const result = await uploadBufferToCloudinary(buffer);

    const ocrRoot = result?.info?.ocr?.["adv_ocr:document"];
    const ocrData = ocrRoot?.data?.[0];

    const text =
      ocrData?.fullTextAnnotation?.text ||
      ocrData?.textAnnotations?.[0]?.description ||
      "";

    // Save as a scanned note

    const { data: note, error: insertError } = await supabase
      .from("notes")
      .insert({
        title,
        content: text,
        version: 1,
        author_id: user.id,
        course,
        topic,
        visibility: "public",
        type: "scanned",
        file_url: result.secure_url,
      })
      .select("id")
      .single();

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      id: note.id,
      text,
      ocr: result?.info?.ocr,
    });
  } catch (err: any) {
    console.error("OCR ERROR:", err);
    return Response.json(
      { error: err?.message ?? "OCR failed" },
      { status: 500 }
    );
  }
}
