import { createWorker } from "tesseract.js";

export async function extractTextFromImage(image: File): Promise<string> {
  const worker = await createWorker("eng");

  try {
    const {
      data: { text },
    } = await worker.recognize(image);

    await worker.terminate();
    return text;
  } catch (err) {
    console.error("OCR failed:", err);
    return "Error extracting text";
  }
}
