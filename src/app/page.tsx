"use client";

import { ShiftPreviewList } from "@/components/ShiftPreviewList";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { CalendarRange, Download, Loader2, Sparkles, UploadCloud, Wand2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [parsedSchedule, setParsedSchedule] = useState<ScheduleEntry[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const uploaderRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUploaderHighlighted, setIsUploaderHighlighted] = useState(false);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
      setParsedSchedule([]);
      setIsPreviewOpen(false);
    }
  };

  const handleClearUpload = () => {
    setImage(null);
    setParsedSchedule([]);
    setIsPreviewOpen(false);
  };

  const handleReplacePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRunOCR = async () => {
    if (!image) return;
    setLoading(true);
    setParsedSchedule([]);

    try {
      const text = await extractTextFromImage(image);
      const cleanedText = cleanOCRText(text);
      const withDates = resolveRelativeDates(cleanedText);
      const finalText = withDates.split("\n").map(cleanKnownLocations).join("\n");

      const parsed = parseScheduleFromOCR(finalText);
      setParsedSchedule(parsed);
    } catch (error) {
      console.error("Failed to extract schedule", error);
    } finally {
      setLoading(false);
    }
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

  const handleOpenPreview = () => {
    if (!previewUrl) return;
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleScrollToUploader = () => {
    uploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsUploaderHighlighted(true);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      setIsUploaderHighlighted(false);
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

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
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="grid w-full gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 text-left text-slate-100 backdrop-blur sm:grid-cols-3">
              {steps.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/5 p-4">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-sky-100">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-sky-100/90">
                      Step {index + 1}: {title}
                    </p>
                    <p className="mt-2 text-sm text-slate-200/80">{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="lg"
              className="gap-2 bg-sky-500 text-white hover:bg-sky-500/90"
              onClick={handleScrollToUploader}
            >
              Let&apos;s go
            </Button>
          </div>
        </header>

        <div
          ref={uploaderRef}
          className="mt-16 grid flex-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
        >
          <Card
            className={cn(
              "border-white/20 bg-white/85 shadow-2xl shadow-sky-500/10 backdrop-blur",
              isUploaderHighlighted &&
                "ring-2 ring-sky-400/80 ring-offset-2 ring-offset-slate-950/40 transition duration-500 ease-out"
            )}
          >
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
                  <Wand2 className="size-6 text-sky-500" />
                  Upload & preview your schedule
                </CardTitle>
                <CardDescription className="max-w-xl text-slate-600">
                  Start by selecting a screenshot of your shifts. Tap the preview to pop it into a distraction-free full-screen view before running the extractor.
                </CardDescription>
              </div>
              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start text-slate-500 hover:text-slate-900"
                  onClick={handleClearUpload}
                >
                  <X className="size-4" />
                  Remove image
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileUpload}
              />

              {image && previewUrl ? (
                <div className="space-y-5">
                  <div
                    role="presentation"
                    className="group relative max-h-[28rem] overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-950/60 shadow-inner"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Uploaded schedule preview"
                      className="mx-auto block max-h-[32rem] w-full origin-center bg-slate-900/40 object-contain transition duration-300 ease-out group-hover:scale-[1.02]"
                      onClick={handleOpenPreview}
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 text-slate-100">
                      <div>
                        <p className="text-sm font-semibold leading-tight">{image.name}</p>
                        <p className="text-xs text-slate-300/80">{formatFileSize(image.size)}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="pointer-events-auto bg-white/90 text-slate-900 hover:bg-white"
                        onClick={handleReplacePhoto}
                      >
                        <UploadCloud className="size-3.5" />
                        Replace photo
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white/75 px-8 py-16 text-center transition hover:border-sky-400 hover:bg-white",
                    loading && "pointer-events-none opacity-70"
                  )}
                >
                  <div className="flex size-20 items-center justify-center rounded-full bg-sky-100 text-sky-500 shadow-inner transition group-hover:scale-105">
                    <UploadCloud className="size-8" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900">Drag & drop or browse for your schedule</p>
                  <p className="max-w-md text-sm text-slate-500">
                    JPG, PNG, and HEIC images are supported. Crystal clear photos give the extractor the best chance to nail every
                    shift.
                  </p>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Click to choose a file</span>
                </label>
              )}

            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">Run the extractor to populate your shifts, then export them to your calendar.</p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  onClick={handleRunOCR}
                  disabled={!image || loading}
                  className="w-full gap-2 bg-sky-500 text-white hover:bg-sky-500/90 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Scanning upload…
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
              </div>
            </CardFooter>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-white/30 bg-white/80 shadow-xl shadow-sky-500/5 backdrop-blur">
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
                  Review the extracted shifts below. We’ll keep them ordered exactly as they appear on your schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading && (
                  <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sky-700">
                    <Loader2 className="size-4 animate-spin" />
                    <div>
                      <p className="text-sm font-medium">Scanning your upload</p>
                      <p className="text-xs text-sky-600/80">Hang tight—this usually wraps up in just a few seconds.</p>
                    </div>
                  </div>
                )}

                {hasSchedule ? (
                  <ShiftPreviewList shifts={parsedSchedule} />
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-500">
                    <p className="text-sm font-medium">No shifts yet—run the extractor to see them here.</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Tip: ensure dates and times are sharp and unobstructed for the most accurate results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {isPreviewOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 z-0 h-full w-full cursor-zoom-out"
            onClick={handleClosePreview}
            aria-label="Close preview"
          />
          <div className="relative z-10 mx-auto flex max-h-[90vh] max-w-4xl items-center justify-center p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Full size schedule preview" className="max-h-full w-full rounded-2xl object-contain shadow-2xl" />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-6 top-6 rounded-full bg-white/90 text-slate-900 hover:bg-white"
              onClick={handleClosePreview}
            >
              <X className="size-5" />
              <span className="sr-only">Close preview</span>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
