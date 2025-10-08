"use client";

import { ShiftPreviewList } from "@/components/ShiftPreviewList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cleanKnownLocations } from "@/utils/cleanKnownLocations";
import { cleanOCRText } from "@/utils/cleantext";
import { extractTextFromImage } from "@/utils/ocr";
import { parseScheduleFromOCR, ScheduleEntry } from "@/utils/parser";
import { resolveRelativeDates } from "@/utils/resolveRelativeDates";
import {
  CalendarRange,
  Download,
  ImageIcon,
  Loader2,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: UploadCloud,
    title: "Upload your schedule",
    description: "Add a screenshot or photo of the shifts you received from Disney.",
  },
  {
    icon: Wand2,
    title: "We read and tidy",
    description: "Our OCR cleans messy text, detects dates, and lines up every shift.",
  },
  {
    icon: CalendarRange,
    title: "Export in one tap",
    description: "Download a calendar-ready .ics file for Google, Apple, or Outlook.",
  },
];

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedSchedule, setParsedSchedule] = useState<ScheduleEntry[]>([]);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  const hasSchedule = parsedSchedule.length > 0;
  const showDebugText = useMemo(
    () => Boolean(ocrText && process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"),
    [ocrText]
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
      setParsedSchedule([]);
      setOcrText("");
    }
  };

  const handleClearUpload = () => {
    setImage(null);
    setParsedSchedule([]);
    setOcrText("");
  };

  const handleRunOCR = async () => {
    if (!image) return;
    setLoading(true);

    const text = await extractTextFromImage(image);
    const cleanedText = cleanOCRText(text);
    const withDates = resolveRelativeDates(cleanedText);
    const finalText = withDates.split("\n").map(cleanKnownLocations).join("\n");

    setOcrText(finalText);

    const parsed = parseScheduleFromOCR(finalText);
    setParsedSchedule(parsed);
    setLoading(false);
  };

  const handleDownloadICS = async () => {
    const res = await fetch("/api/generate-ics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedSchedule),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "disney_schedule.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(167,139,250,0.18),_transparent_55%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-16 sm:px-8">
        <header className="mx-auto max-w-3xl text-center text-slate-100">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wide text-sky-100 backdrop-blur">
            <Sparkles className="size-4" />
            Disney cast member helper
          </span>
          <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">
            Turn your Disney shifts into a polished calendar in seconds
          </h1>
          <p className="mt-4 text-lg text-slate-200">
            Upload your schedule screenshot, let our OCR do the busy work, and download a clean .ics file ready to drop into your favorite calendar.
          </p>
        </header>

        <div className="mt-12 grid flex-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/20 bg-white/80 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                <Wand2 className="size-6 text-sky-500" />
                Create your calendar export
              </CardTitle>
              <CardDescription className="text-slate-600">
                Pick a schedule image below. We will parse it, highlight the shifts we find, and prep an .ics file for download.
              </CardDescription>
              {image && (
                <CardAction>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-900"
                    onClick={handleClearUpload}
                  >
                    <X className="size-4" />
                    Clear
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              <label
                htmlFor="file-upload"
                className={cn(
                  "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center transition hover:border-sky-400 hover:bg-white",
                  image && "border-sky-400 bg-white"
                )}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
                <div className="flex size-16 items-center justify-center rounded-full bg-sky-100 text-sky-500 transition group-hover:scale-105">
                  <UploadCloud className="size-7" />
                </div>
                {image ? (
                  <>
                    <p className="text-base font-semibold text-slate-900">
                      {image.name}
                    </p>
                    <p className="text-sm text-slate-500">{formatFileSize(image.size)}</p>
                    <p className="text-xs text-slate-400">
                      Need a different image? Click to replace it.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-slate-900">
                      Drag & drop or browse for your schedule
                    </p>
                    <p className="text-sm text-slate-500">
                      JPG, PNG, and HEIC images are supported. Larger photos may take a few seconds to process.
                    </p>
                  </>
                )}
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                {steps.map(({ icon: Icon, title, description }, index) => (
                  <div
                    key={title}
                    className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {index + 1}. {title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                onClick={handleRunOCR}
                disabled={!image || loading}
                className="w-full gap-2 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing image…
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4" />
                    Extract shifts
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadICS}
                disabled={!hasSchedule}
                className="w-full gap-2 border-slate-300 text-slate-700 hover:border-sky-400 hover:text-sky-600 sm:w-auto"
              >
                <Download className="size-4" />
                Download .ics file
              </Button>
            </CardFooter>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-white/30 bg-white/70 shadow-lg backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                  <ImageIcon className="size-5 text-sky-500" />
                  Uploaded preview
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Make sure everything is readable—clear photos lead to better OCR results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewUrl ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Uploaded schedule preview"
                      className="max-h-[22rem] w-full object-contain bg-slate-100"
                    />
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/70 text-center text-slate-500">
                    <ImageIcon className="size-8 text-slate-300" />
                    <p className="text-sm font-medium">No image uploaded yet</p>
                    <p className="text-xs text-slate-400">Your preview will appear here after you choose a file.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/30 bg-white/80 shadow-lg backdrop-blur">
              <CardHeader className="flex flex-wrap items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                  <CalendarRange className="size-5 text-sky-500" />
                  Shift preview
                </CardTitle>
                {hasSchedule && (
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-600">
                    {parsedSchedule.length} shift{parsedSchedule.length > 1 ? "s" : ""} detected
                  </span>
                )}
                <CardDescription className="basis-full text-slate-600">
                  We’ll list each shift as soon as the image has been processed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasSchedule ? (
                  <ShiftPreviewList shifts={parsedSchedule} />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-500">
                    <p className="text-sm font-medium">
                      No shifts yet—run the extractor to see them here.
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Tip: double-check that dates and start/end times are clearly visible in your upload.
                    </p>
                  </div>
                )}

                {showDebugText && (
                  <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-left text-xs text-slate-600">
                    <p className="font-semibold uppercase tracking-wide text-slate-500">OCR output</p>
                    <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-[11px]">
                      {ocrText}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
