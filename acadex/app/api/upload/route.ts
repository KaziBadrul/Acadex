import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create uploads folder inside public
  const uploadDir = path.join(process.cwd(), "public/uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  // Prevent filename collision
  const filename = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, filename);

  // Save file
  await fs.writeFile(filePath, buffer);

  return NextResponse.json({
    success: true,
    path: `/uploads/${filename}`,
  });
}
