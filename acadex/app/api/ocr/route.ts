import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import tesseract from "node-tesseract-ocr";
import { execSync } from "child_process";

export async function POST(req: Request) {
  // Accept JSON body { path: '/uploads/...' } or form-data 'path'
  let filePathFromBody: string | undefined;
  try {
    const body = await req.json();
    filePathFromBody = body?.path;
  } catch (e) {
    try {
      const form = await req.formData();
      const p = form.get("path");
      if (typeof p === "string") filePathFromBody = p;
    } catch (err) {
      // ignore
    }
  }

  if (!filePathFromBody) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  if (!filePathFromBody.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const absPath = path.join(process.cwd(), "public", filePathFromBody.replace(/^\//, ""));

  if (!fs.existsSync(absPath)) {
    return NextResponse.json({ error: "File not found", path: absPath }, { status: 404 });
  }

  try {
    // Check Tesseract CLI availability
    try {
      execSync("tesseract -v", { stdio: "ignore" });
    } catch (cliErr) {
      return NextResponse.json(
        {
          error:
            "Tesseract CLI not found on server. Please install Tesseract OCR on your machine (https://tesseract-ocr.github.io/).",
        },
        { status: 500 }
      );
    }

    console.log("Starting OCR (node-tesseract-ocr) for", absPath);

    const config = {
      lang: "eng",
      oem: 1,
      psm: 3,
    } as any;

    // run OCR (this uses the system tesseract binary)
    const timeoutMs = 60000;
    const ocrPromise = tesseract.recognize(absPath, config);
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error(`OCR timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    const text = await Promise.race([ocrPromise, timeoutPromise]);

    console.log("OCR result for", filePathFromBody, ":\n", text);

    return NextResponse.json({ success: true, text: text ?? "" });
  } catch (err: any) {
    console.error("OCR error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
