import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only images and PDFs are allowed" },
      { status: 400 }
    );
  }

  // ✅ Limit file size (5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size must be under 5MB" },
      { status: 400 }
    );
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create uploads folder inside public
  const uploadDir = path.join(process.cwd(), "public/uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  // Prevent filename collision
  const safeName = file.name.replace(/\s+/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const filePath = path.join(uploadDir, filename);

  // Save file
  await fs.writeFile(filePath, buffer);

  return NextResponse.json({
    success: true,
    path: `/uploads/${filename}`,
    type: file.type,
  });
}
