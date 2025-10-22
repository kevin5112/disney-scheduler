import { OEM, PSM, createWorker } from "tesseract.js";
import { preprocessImageForOCR } from "./preprocessImage";

export async function extractTextFromImage(image: File): Promise<string> {
  const worker = await createWorker("eng");

  try {
    const preprocessed = await preprocessImageForOCR(image);
    const sources: Array<File | Blob> = [preprocessed];

    if (preprocessed !== image) {
      sources.push(image);
    }

    const baseParameters = {
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:-/,. ",
      preserve_interword_spaces: "1",
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
      user_defined_dpi: "300",
    } as const;

    const pageSegmentationModes = [
      PSM.AUTO,
      PSM.SINGLE_COLUMN,
      PSM.SPARSE_TEXT,
    ];

    let bestText = "";
    let bestConfidence = -Infinity;

    for (const source of sources) {
      for (const mode of pageSegmentationModes) {
        await worker.setParameters({
          ...baseParameters,
          tessedit_pageseg_mode: mode,
        });

        const {
          data: { text, confidence = 0 },
        } = await worker.recognize(source);

        const trimmedText = text.trim();

        if (
          confidence > bestConfidence ||
          (confidence === bestConfidence && trimmedText.length > bestText.length)
        ) {
          bestConfidence = confidence;
          bestText = trimmedText;
        }
      }
    }

    await worker.terminate();
    return bestText || "";
  } catch (err) {
    console.error("OCR failed:", err);
    await worker.terminate();
    return "Error extracting text";
  }
}
