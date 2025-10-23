import { OEM, PSM, createWorker } from "tesseract.js";
import { preprocessImageForOCR } from "./preprocessImage";

type CandidateResult = {
  text: string;
  confidence: number;
};

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
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:-/,. &'()",
      preserve_interword_spaces: "1",
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
      user_defined_dpi: "300",
    } as const;

    const pageSegmentationModes = [
      PSM.AUTO,
      PSM.SINGLE_COLUMN,
      PSM.SPARSE_TEXT,
    ];

    const candidateResults: CandidateResult[] = [];

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
        candidateResults.push({ text: trimmedText, confidence });
      }
    }

    if (!candidateResults.length) {
      return "";
    }

    const score = ({ text, confidence }: CandidateResult) => {
      const compactLength = Math.min(text.replace(/\s+/g, "").length, 2000);
      if (compactLength === 0) return 0;

      const lineCount = text
        .split(/\n+/)
        .filter((line) => line.trim().length > 0).length;

      const tokens = text
        .split(/[^A-Za-z0-9]+/)
        .map((token) => token.trim())
        .filter(Boolean);
      const multiCharTokens = tokens.filter((token) => token.length >= 3).length;

      const uniqueCharacters = new Set(text.replace(/\s+/g, "")).size;

      const confidenceWeight = confidence * Math.min(1, compactLength / 12);
      const lengthWeight = compactLength * 1.4;
      const structureWeight = lineCount * 4;
      const vocabularyWeight = multiCharTokens * 6;
      const diversityWeight = uniqueCharacters * 2.5;

      let totalScore =
        confidenceWeight +
        lengthWeight +
        structureWeight +
        vocabularyWeight +
        diversityWeight;

      if (compactLength <= 2) {
        totalScore -= 45;
      } else if (compactLength <= 3) {
        totalScore -= 25;
      } else if (multiCharTokens === 0) {
        totalScore -= 12;
      }

      return Math.max(totalScore, 0);
    };

    let bestResult = candidateResults[0];

    for (let index = 1; index < candidateResults.length; index += 1) {
      const candidate = candidateResults[index];
      const bestScore = score(bestResult);
      const currentScore = score(candidate);
      if (currentScore > bestScore) {
        bestResult = candidate;
        continue;
      }
      if (currentScore === bestScore && candidate.text.length > bestResult.text.length) {
        bestResult = candidate;
      }
    }

    return bestResult.text || "";
  } catch (err) {
    console.error("OCR failed:", err);
    return "Error extracting text";
  } finally {
    await worker.terminate();
  }
}
