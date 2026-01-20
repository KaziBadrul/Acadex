import tesseract from "node-tesseract-ocr";
import { execSync } from "child_process";

export async function runOcr(absPath: string): Promise<string> {
  // Ensure Tesseract CLI exists
  try {
    execSync("tesseract -v", { stdio: "ignore" });
  } catch {
    throw new Error(
      "Tesseract CLI not found on server. Install tesseract-ocr."
    );
  }

  const config = {
    lang: "eng",
    oem: 1,
    psm: 6, // good for timetable-like text blocks
  } as any;

  const timeoutMs = 60000;
  const ocrPromise = tesseract.recognize(absPath, config);
  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(
      () => reject(new Error(`OCR timed out after ${timeoutMs}ms`)),
      timeoutMs
    )
  );

  const text = await Promise.race([ocrPromise, timeoutPromise]);
  return text ?? "";
}
