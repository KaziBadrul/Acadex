import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ bypasses RLS
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const course = formData.get("course") as string | null;
    const topic = formData.get("topic") as string | null;
    const author_id = formData.get("author_id") as string | null;
    const visibility = (formData.get("visibility") as string | null) || "public";
    const group_id = formData.get("group_id") as string | null;

    if (!file || !title || !author_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const filePath = `files/${author_id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, file, { contentType: "application/pdf" });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from("files")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("notes").insert({
      title,
      content: "",
      version: 1,
      author_id,
      course,
      topic,
      visibility,
      group_id: visibility === "group" ? (group_id || null) : null,
      type: "pdf",
      file_url: publicUrl.publicUrl,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl.publicUrl,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
