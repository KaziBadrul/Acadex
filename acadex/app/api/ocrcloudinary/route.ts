import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs"; // Cloudinary Node SDK runs on Node.js (not Edge)

function uploadBufferToCloudinary(buffer: Buffer) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "handwriting_ocr",
        resource_type: "image",
        // OCR add-on:
        // - adv_ocr = general text in photos
        // - adv_ocr:document = best for scanned/text-heavy images (often better for handwriting notes)
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
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBufferToCloudinary(buffer);

    // Cloudinary OCR response:
    // result.info.ocr.adv_ocr.data[...] includes a "description" with the extracted text. :contentReference[oaicite:5]{index=5}
    // const ocrData = result?.info?.ocr?.adv_ocr?.data;
    // const text =
    //   Array.isArray(ocrData) && ocrData[0]?.description
    //     ? ocrData[0].description
    //     : "";

    // console.log("OCR FULL:", JSON.stringify(result?.info?.ocr, null, 2));
    const ocrRoot = result?.info?.ocr?.["adv_ocr:document"];

    console.log("OCR ROOT KEYS:", Object.keys(ocrRoot || {}));

    const ocrData = ocrRoot?.data?.[0];

    console.log("DATA[0] KEYS:", Object.keys(ocrData || {}));

    const text =
      ocrData?.fullTextAnnotation?.text ||
      ocrData?.textAnnotations?.[0]?.description ||
      "";

    console.log("EXTRACTED TEXT:", text);

    return Response.json({
      public_id: result.public_id,
      ocr: result?.info?.ocr,
      text,
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "OCR failed" },
      { status: 500 }
    );
  }
}
