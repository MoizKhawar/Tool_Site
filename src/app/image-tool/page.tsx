"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getToolBySlug } from "@/lib/tool-data";

type OutputFormat = "jpeg" | "png" | "webp";

type ImageSettings = {
  width: string;
  height: string;
  quality: number;
  format: OutputFormat;
  keepAspectRatio: boolean;
};

const sampleOptions = [
  { title: "Large photo", size: "2.8MB", accent: "#22d3ee" },
  { title: "Artwork", size: "2.9MB", accent: "#60a5fa" },
  { title: "Device screen", size: "1.6MB", accent: "#34d399" },
  { title: "SVG icon", size: "13KB", accent: "#f59e0b" },
];

const imageFormats: Array<{ value: OutputFormat; label: string; note: string }> = [
  { value: "jpeg", label: "JPEG", note: "Best for photos and compressed exports" },
  { value: "png", label: "PNG", note: "Best for transparency and crisp graphics" },
  { value: "webp", label: "WebP", note: "Modern lightweight web delivery" },
];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the selected image."));
    image.src = src;
  });
}

function createDemoFile(title: string, size: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="900" viewBox="0 0 1280 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="1280" height="900" rx="56" fill="url(#bg)" />
      <rect x="92" y="92" width="1096" height="716" rx="44" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
      <circle cx="1038" cy="188" r="116" fill="url(#accent)" />
      <text x="140" y="260" fill="#e2e8f0" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700">${title}</text>
      <text x="140" y="338" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif" font-size="34">${size} demo file</text>
      <text x="140" y="760" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="28">ToolForge sample image</text>
    </svg>
  `;

  return new File([svg], `${title.toLowerCase().replace(/\s+/g, "-")}.svg`, {
    type: "image/svg+xml",
  });
}

export default function ImageToolPage() {
  const tool = getToolBySlug("image-tool");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("optimized-image.webp");
  const [statusText, setStatusText] = useState("Drop an image or paste one to begin.");
  const [settings, setSettings] = useState<ImageSettings>({
    width: "1600",
    height: "1200",
    quality: 82,
    format: "webp",
    keepAspectRatio: true,
  });

  useEffect(() => {
    if (!selectedFile) {
      setSourceUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setSourceUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  async function pasteFromClipboard() {
    if (!("clipboard" in navigator) || !navigator.clipboard?.read) {
      setStatusText("Clipboard image paste is not available in this browser.");
      return;
    }

    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (!imageType) {
          continue;
        }

        const blob = await item.getType(imageType);
        setSelectedFile(new File([blob], `pasted.${imageType.split("/")[1]}`, { type: imageType }));
        setStatusText("Pasted image from clipboard.");
        return;
      }

      setStatusText("No image found on the clipboard.");
    } catch {
      setStatusText("Clipboard access was blocked. Use upload instead.");
    }
  }

  async function processImage() {
    if (!selectedFile || !sourceUrl) {
      setStatusText("Choose an image first.");
      return;
    }

    setStatusText("Processing image...");

    try {
      const image = await loadImage(sourceUrl);
      const originalWidth = image.naturalWidth;
      const originalHeight = image.naturalHeight;
      const requestedWidth = Number(settings.width) || originalWidth;
      const requestedHeight = Number(settings.height) || originalHeight;

      let outputWidth = requestedWidth;
      let outputHeight = requestedHeight;

      if (settings.keepAspectRatio) {
        const ratio = originalWidth / originalHeight;

        if (requestedWidth && requestedHeight) {
          const fittedHeight = Math.round(requestedWidth / ratio);
          if (fittedHeight <= requestedHeight) {
            outputWidth = requestedWidth;
            outputHeight = fittedHeight;
          } else {
            outputHeight = requestedHeight;
            outputWidth = Math.round(requestedHeight * ratio);
          }
        } else if (requestedWidth) {
          outputWidth = requestedWidth;
          outputHeight = Math.round(requestedWidth / ratio);
        } else if (requestedHeight) {
          outputHeight = requestedHeight;
          outputWidth = Math.round(requestedHeight * ratio);
        }
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not available in this browser.");
      }

      canvas.width = Math.max(1, outputWidth);
      canvas.height = Math.max(1, outputHeight);

      if (settings.format === "jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const mimeType =
        settings.format === "jpeg"
          ? "image/jpeg"
          : settings.format === "png"
            ? "image/png"
            : "image/webp";
      const quality = settings.format === "png" ? undefined : settings.quality / 100;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (nextBlob) => {
            if (!nextBlob) {
              reject(new Error("Could not create the output image."));
              return;
            }

            resolve(nextBlob);
          },
          mimeType,
          quality,
        );
      });

      const nextUrl = URL.createObjectURL(blob);
      setResultUrl((previous) => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }

        return nextUrl;
      });

      const extension = settings.format === "jpeg" ? "jpg" : settings.format;
      setResultName(`optimized-${selectedFile.name.replace(/\.[^.]+$/, "")}.${extension}`);
      setStatusText(`Exported ${canvas.width} × ${canvas.height} as ${settings.format.toUpperCase()}.`);
    } catch (error) {
      setStatusText(
        error instanceof Error ? error.message : "Something went wrong while processing the file.",
      );
    }
  }

  const activePreview = resultUrl ?? sourceUrl;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1">Image Tool</span>
          <span className="text-slate-300">{tool?.description ?? "Drop, resize, convert, download"}</span>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-inner shadow-black/20">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-medium text-white">Drop image</p>
                  <p className="text-sm text-slate-400">or use one of the sample sources below</p>
                </div>
                <button
                  type="button"
                  onClick={pasteFromClipboard}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
                >
                  Paste
                </button>
              </div>

              <label className="mt-5 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-6 text-center transition hover:border-cyan-300/40 hover:bg-white/[0.08]">
                {activePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePreview}
                    alt="Preview"
                    className="max-h-72 w-full rounded-2xl object-contain"
                  />
                ) : (
                  <>
                    <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">Drag and drop</div>
                    <div className="mt-2 text-3xl font-semibold text-white">Image</div>
                    <div className="mt-2 text-sm text-slate-400">Supported: JPG, PNG, WebP and more</div>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {sampleOptions.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/30 hover:bg-white/[0.08]"
                  onClick={() =>
                    setSelectedFile(createDemoFile(sample.title, sample.size, sample.accent))
                  }
                >
                  <div className="text-sm font-medium text-white">{sample.title}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">{sample.size}</div>
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-5 rounded-[1.75rem] border border-cyan-300/15 bg-slate-950/40 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Target width</span>
                <input
                  type="number"
                  min="1"
                  value={settings.width}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, width: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Target height</span>
                <input
                  type="number"
                  min="1"
                  value={settings.height}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, height: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              <span className="block font-medium text-white">Output format</span>
              <select
                value={settings.format}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    format: event.target.value as OutputFormat,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
              >
                {imageFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400">
                {imageFormats.find((format) => format.value === settings.format)?.note}
              </p>
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span className="block font-medium text-white">Compression quality</span>
              <input
                type="range"
                min="40"
                max="100"
                value={settings.quality}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, quality: Number(event.target.value) }))
                }
                className="w-full accent-cyan-400"
              />
              <div className="text-xs text-slate-400">{settings.quality}% quality</div>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={settings.keepAspectRatio}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, keepAspectRatio: event.target.checked }))
                }
                className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400"
              />
              Keep the original aspect ratio
            </label>

            <button
              type="button"
              onClick={processImage}
              className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Convert image
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {statusText}
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">File</span>
                <span className="truncate text-white">{selectedFile ? selectedFile.name : "No file selected"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Preview</span>
                <span className="text-white">{settings.format.toUpperCase()}</span>
              </div>
              {resultUrl ? (
                <a
                  href={resultUrl}
                  download={resultName}
                  className="inline-flex items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 font-medium text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  Download optimized image
                </a>
              ) : null}
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Small", "Smaller images mean faster load times and lighter pages."],
            ["Simple", "Open your image, compare the result, and save instantly."],
            ["Secure", "Everything happens locally in the browser."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/[0.08] hover:text-white"
          >
            Back to home
          </Link>
          <Link
            href="/metadata-tool"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/[0.08] hover:text-white"
          >
            Open metadata tool
          </Link>
        </div>
      </section>
    </main>
  );
}
