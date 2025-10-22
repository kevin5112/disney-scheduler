import { PSM, createWorker } from "tesseract.js";
import type { Word } from "tesseract.js";
import { preprocessImageForOCR } from "./preprocessImage";
import { normaliseTimeCandidate, TimeTokenOverride } from "./timeTokens";

function scoreTimeCandidates(word: Word): TimeTokenOverride | null {
  const baseCandidate = normaliseTimeCandidate(word.text);
  const allChoices = [
    { text: word.text, confidence: word.confidence },
    ...(word.choices ?? []),
  ];

  const seen = new Set<string>();
  const candidates = allChoices
    .map(({ text, confidence }) => {
      if (!text || seen.has(text)) return null;
      seen.add(text);

      const normalized = normaliseTimeCandidate(text);
      if (!normalized) return null;

      return { normalized, confidence };
    })
    .filter((value): value is { normalized: string; confidence: number } => value !== null);

  if (!candidates.length && !baseCandidate) {
    return null;
  }

  const quarterTargets = [0, 15, 30, 45];

  const scored = candidates.map((candidate) => {
    const minutes = Number(candidate.normalized.split(":")[1]);
    const quarterDistance = Math.min(
      ...quarterTargets.map((target) => Math.abs(target - minutes)),
    );

    const score = candidate.confidence - quarterDistance * 8;

    return { ...candidate, quarterDistance, score };
  });

  let best = scored[0] ?? null;
  for (let i = 1; i < scored.length; i++) {
    const candidate = scored[i];
    if (!best || candidate.score > best.score) {
      best = candidate;
      continue;
    }

    if (candidate.score === best.score && candidate.quarterDistance < best.quarterDistance) {
      best = candidate;
    }
  }

  const corrected = best?.normalized ?? baseCandidate;
  if (!corrected) {
    return null;
  }

  const raw = baseCandidate ?? corrected;
  return { raw, corrected };
}

function collectTimeOverrides(words: Word[] | undefined): TimeTokenOverride[] {
  if (!words) return [];

  const overrides: TimeTokenOverride[] = [];

  for (const word of words) {
    if (!/[:.]/.test(word.text)) {
      continue;
    }

    const override = scoreTimeCandidates(word);
    if (override) {
      overrides.push(override);
    }
  }

  return overrides;
}

export async function extractTextFromImage(
  image: File,
): Promise<{ text: string; timeTokens: TimeTokenOverride[] }> {
  const worker = await createWorker("eng");

  try {
    const source = await preprocessImageForOCR(image);

    await worker.setParameters({
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:-/,. ",
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
    });

    const result = await worker.recognize(source);
    const { text } = result.data;
    const words = (result.data as typeof result.data & { words?: Word[] }).words;

    await worker.terminate();
    const timeTokens = collectTimeOverrides(words ?? undefined);
    return { text, timeTokens };
  } catch (err) {
    console.error("OCR failed:", err);
    await worker.terminate();
    return { text: "Error extracting text", timeTokens: [] };
  }
}
