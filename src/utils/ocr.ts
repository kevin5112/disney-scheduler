import { createWorker } from "tesseract.js";
import { preprocessImageForOCR } from "./preprocessImage";

export async function extractTextFromImage(image: File): Promise<string> {
  const worker = await createWorker("eng");

  try {
    const source = await preprocessImageForOCR(image);

    await worker.setParameters({
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:-/,. ",
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: "4",
    });

    const {
      data: { text },
    } = await worker.recognize(source);

    await worker.terminate();
    return text;
  } catch (err) {
    console.error("OCR failed:", err);
    await worker.terminate();
    return "Error extracting text";
  }
}
