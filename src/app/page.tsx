"use client";

import { cleanOCRText } from "@/utils/cleantext";
import { extractTextFromImage } from "@/utils/ocr";
import { parseScheduleFromOCR } from "@/utils/parser";
import { useState } from "react";
import { ScheduleEntry } from "@/utils/parser";
import { ShiftPreviewList } from "@/components/ShiftPreviewList";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedSchedule, setParsedSchedule] = useState<ScheduleEntry[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
      setOcrText("");
    }
  };

  const handleRunOCR = async () => {
    if (!image) return;
    setLoading(true);

    const text = await extractTextFromImage(image);
    const cleanedText = cleanOCRText(text);
    console.log("OCR Output:", cleanedText);
    setOcrText(cleanedText);

    const parsed = parseScheduleFromOCR(cleanedText);
    console.log("Parsed Schedule:", parsed);
    setParsedSchedule(parsed);
    console.log("JSON Schedule:", JSON.stringify(parsedSchedule));

    setLoading(false);
  };

  const handleDownloadICS = async () => {
    const res = await fetch("/api/generate-ics", {
      method: "POST",
      headers: { "Content-Type": "applicaiton/json" },
      body: JSON.stringify(parsedSchedule),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "disney_schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-slate-400">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Disney Schedule to Calendar
      </h1>

      <label
        htmlFor="file-upload"
        className="flex items-center justify-center w-full max-w-sm px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md cursor-pointer hover:bg-blue-700 transition mb-4"
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*"
        />
        Upload Schedule Image
      </label>

      {image && (
        <>
          <img
            src={URL.createObjectURL(image)}
            alt="Uploaded Preview"
            className="max-h-64 border rounded mb-4"
          />
          <button
            onClick={handleRunOCR}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mb-4"
          >
            {loading ? "Processing..." : "Extract Text"}
          </button>
        </>
      )}
      {/* {ocrText && (
        <div className="mt-6 w-full max-w-2xl bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
          <h2 className="font-semibold text-lg mb-2">OCR Result:</h2>
          <p className="text-black">{ocrText}</p>
        </div>
      )} */}
      {parsedSchedule.length > 0 && (
        <ShiftPreviewList shifts={parsedSchedule} />
      )}

      {parsedSchedule?.length > 0 && (
        <button
          onClick={handleDownloadICS}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green700"
        >
          Download .ics File
        </button>
      )}
    </main>
  );
}
