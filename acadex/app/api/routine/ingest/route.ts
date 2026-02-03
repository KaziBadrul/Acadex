import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { runOcr } from "@/lib/ocr";
import { parseRoutine } from "@/lib/parseRoutine";
import { IngestResponse } from "@/lib/types";

export const runtime = "nodejs"; // IMPORTANT for node-tesseract-ocr

function safeFilename(originalName: string) {
  const base = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const stamp = Date.now();
  return `${stamp}_${base}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json<IngestResponse>(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Save into /public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const filename = safeFilename(file.name || "routine.png");
    const absPath = path.join(uploadsDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(absPath, Buffer.from(arrayBuffer));

    // OCR + Parse
    const ocrText = await runOcr(absPath);
    const routineEvents = parseRoutine(ocrText);

    return NextResponse.json<IngestResponse>({
      success: true,
      imagePath: `/uploads/${filename}`,
      ocrText,
      routineEvents,
    });
  } catch (err: any) {
    return NextResponse.json<IngestResponse>(
      { success: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
