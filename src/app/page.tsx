"use client";

import { useEffect, useMemo, useState } from "react";

type OutputFormat = "jpeg" | "png" | "webp";

type ImageSettings = {
  width: string;
  height: string;
  quality: number;
  format: OutputFormat;
  keepAspectRatio: boolean;
};

type MetadataDraft = {
  title: string;
  author: string;
  description: string;
  keywords: string;
  location: string;
  latitude: string;
  longitude: string;
  copyright: string;
};

type SeoDraft = {
  pageTitle: string;
  pageDescription: string;
  slug: string;
  canonicalUrl: string;
  primaryKeyword: string;
  ogImage: string;
};

const imageFormats: Array<{
  value: OutputFormat;
  label: string;
  note: string;
}> = [
  { value: "jpeg", label: "JPEG", note: "Best for photos and compressed exports" },
  { value: "png", label: "PNG", note: "Best for transparency and crisp graphics" },
  { value: "webp", label: "WebP", note: "Modern lightweight web delivery" },
];

const initialMetadata: MetadataDraft = {
  title: "Homepage hero image",
  author: "",
  description: "Optimized hero image for the landing page.",
  keywords: "website, hero, conversion, marketing",
  location: "",
  latitude: "",
  longitude: "",
  copyright: "",
};

const initialSeo: SeoDraft = {
  pageTitle: "ToolForge - Image, SEO and Design Utilities",
  pageDescription:
    "Resize images, change formats, edit geotags and metadata, and preview clean SEO snippets in one toolbox.",
  slug: "/",
  canonicalUrl: "https://yourdomain.com",
  primaryKeyword: "image tools",
  ogImage: "https://yourdomain.com/og-image.png",
};

function buildMapLink(latitude: string, longitude: string) {
  if (!latitude || !longitude) {
    return null;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function downloadText(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getScore(value: string, min: number, max: number) {
  if (!value.trim()) {
    return 0;
  }

  const length = value.trim().length;
  if (length < min) {
    return Math.max(0, Math.round((length / min) * 60));
  }

  if (length > max) {
    return Math.max(40, 100 - Math.min(40, length - max));
  }

  return 100;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("optimized-image.webp");
  const [statusText, setStatusText] = useState("Upload an image to start.");
  const [settings, setSettings] = useState<ImageSettings>({
    width: "1600",
    height: "1200",
    quality: 82,
    format: "webp",
    keepAspectRatio: true,
  });
  const [metadata, setMetadata] = useState<MetadataDraft>(initialMetadata);
  const [seo, setSeo] = useState<SeoDraft>(initialSeo);

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

  const geoLink = useMemo(
    () => buildMapLink(metadata.latitude, metadata.longitude),
    [metadata.latitude, metadata.longitude],
  );

  const seoChecks = useMemo(() => {
    const titleLength = seo.pageTitle.trim().length;
    const descriptionLength = seo.pageDescription.trim().length;
    const keywordInTitle = seo.pageTitle
      .toLowerCase()
      .includes(seo.primaryKeyword.trim().toLowerCase());
    const keywordInDescription = seo.pageDescription
      .toLowerCase()
      .includes(seo.primaryKeyword.trim().toLowerCase());

    const score = Math.round(
      (getScore(seo.pageTitle, 30, 60) +
        getScore(seo.pageDescription, 120, 160) +
        (keywordInTitle ? 100 : 40) +
        (keywordInDescription ? 100 : 60)) /
        4,
    );

    return {
      titleLength,
      descriptionLength,
      keywordInTitle,
      keywordInDescription,
      score,
    };
  }, [seo]);

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
      setStatusText(
        `Exported ${canvas.width} × ${canvas.height} as ${settings.format.toUpperCase()}.`,
      );
    } catch (error) {
      setStatusText(
        error instanceof Error ? error.message : "Something went wrong while processing the file.",
      );
    }
  }

  function exportMetadata() {
    const payload = {
      title: metadata.title,
      author: metadata.author,
      description: metadata.description,
      keywords: metadata.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      location: metadata.location,
      geotag: {
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        googleMapsUrl: geoLink,
      },
      copyright: metadata.copyright,
    };

    downloadText(
      `${metadata.title.trim().toLowerCase().replace(/\s+/g, "-") || "image"}-metadata.json`,
      `${JSON.stringify(payload, null, 2)}\n`,
      "application/json",
    );
  }

  function exportSeoPack() {
    const payload = {
      title: seo.pageTitle,
      description: seo.pageDescription,
      canonicalUrl: seo.canonicalUrl,
      slug: seo.slug,
      primaryKeyword: seo.primaryKeyword,
      ogImage: seo.ogImage,
    };

    downloadText("seo-pack.json", `${JSON.stringify(payload, null, 2)}\n`, "application/json");
  }

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_right,rgba(59,130,246,0.14),transparent_26%)]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-sky-200/80">
            <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1">
              ToolForge
            </span>
            <span className="text-slate-300">Image + SEO + design utilities</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                A practical toolbox for image optimization, metadata, and quick website SEO.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Build a focused utility site for creators and small teams: reduce image size,
                convert formats, manage geotags, edit metadata, and generate clean SEO-ready
                page snippets from one workspace.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Fast browser-side processing
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  SEO preview and checklist
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Design tokens and starter palette
                </span>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-cyan-300/15 bg-slate-950/40 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span>Image studio</span>
                <span className="text-cyan-300">Resize + convert</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span>Metadata lab</span>
                <span className="text-cyan-300">Geotag + export</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span>SEO toolkit</span>
                <span className="text-cyan-300">Preview + pack</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80">
                  01. Image Studio
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Size reducer and format converter
                </h2>
              </div>
              <p className="max-w-sm text-sm text-slate-400">
                Resize to a target box, then export as JPEG, PNG, or WebP. The JPEG preset is
                tuned for compressed delivery.
              </p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <label className="flex cursor-pointer flex-col gap-3 rounded-3xl border border-dashed border-cyan-300/30 bg-white/5 p-5 transition hover:border-cyan-200/60 hover:bg-white/8">
                  <span className="text-sm font-medium text-white">Upload an image</span>
                  <span className="text-sm text-slate-400">
                    PNG, JPEG, WebP, or another browser-supported image file.
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-cyan-300"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  />
                </label>

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
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300/50"
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
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300/50"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    <span className="block font-medium text-white">Compression quality</span>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={settings.quality}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          quality: Number(event.target.value),
                        }))
                      }
                      className="w-full accent-cyan-400"
                    />
                    <div className="text-xs text-slate-400">{settings.quality}% quality</div>
                  </label>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.keepAspectRatio}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        keepAspectRatio: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400"
                  />
                  Keep the original aspect ratio
                </label>

                <button
                  type="button"
                  onClick={processImage}
                  className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Convert image
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  {statusText}
                </div>
              </div>

              <div className="space-y-4">
                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80">
                  <div className="border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.28em] text-slate-400">
                    Preview
                  </div>
                  <div className="flex min-h-64 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_45%)] p-4">
                    {sourceUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resultUrl ?? sourceUrl}
                        alt="Image preview"
                        className="max-h-80 w-full rounded-2xl object-contain"
                      />
                    ) : (
                      <div className="text-center text-sm text-slate-500">
                        Your image preview will appear here.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Original file</span>
                    <span className="truncate text-right text-white">
                      {selectedFile ? selectedFile.name : "No file selected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Export format</span>
                    <span className="text-white">{settings.format.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">Quality</span>
                    <span className="text-white">{settings.quality}%</span>
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
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80">
                  02. Metadata Lab
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Geotag and metadata editor
                </h2>
              </div>
              <p className="max-w-sm text-sm text-slate-400">
                Prepare structured metadata for images, including location, author, keywords, and
                copyright details.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Title", "title"],
                ["Author", "author"],
                ["Location", "location"],
                ["Copyright", "copyright"],
              ].map(([label, field]) => (
                <label key={field} className="space-y-2 text-sm text-slate-300">
                  <span className="block font-medium text-white">{label}</span>
                  <input
                    value={metadata[field as keyof MetadataDraft]}
                    onChange={(event) =>
                      setMetadata((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span className="block font-medium text-white">Description</span>
                <textarea
                  rows={4}
                  value={metadata.description}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, description: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span className="block font-medium text-white">Keywords</span>
                <input
                  value={metadata.keywords}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, keywords: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Latitude</span>
                <input
                  value={metadata.latitude}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, latitude: event.target.value }))
                  }
                  placeholder="e.g. 40.7128"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Longitude</span>
                <input
                  value={metadata.longitude}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, longitude: event.target.value }))
                  }
                  placeholder="e.g. -74.0060"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportMetadata}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Download metadata JSON
              </button>
              <a
                href={geoLink ?? "#"}
                onClick={(event) => {
                  if (!geoLink) {
                    event.preventDefault();
                  }
                }}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  geoLink
                    ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20"
                    : "pointer-events-none border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                Open geotag location
              </a>
            </div>

            <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Location status</span>
                <span className="text-white">{geoLink ? "Coordinates ready" : "Add latitude and longitude"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Metadata mode</span>
                <span className="text-white">Sidecar JSON export</span>
              </div>
              <pre className="overflow-auto rounded-2xl bg-slate-950/80 p-4 text-xs text-cyan-100">
{JSON.stringify(
  {
    title: metadata.title,
    location: metadata.location,
    latitude: metadata.latitude,
    longitude: metadata.longitude,
    keywords: metadata.keywords,
  },
  null,
  2,
)}
              </pre>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80">
                  03. SEO Toolkit
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Meta preview, score, and export
                </h2>
              </div>
              <p className="max-w-sm text-sm text-slate-400">
                Tune page titles and descriptions, then preview how search and social snippets will
                read before publishing.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span className="block font-medium text-white">Page title</span>
                <input
                  value={seo.pageTitle}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, pageTitle: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span className="block font-medium text-white">Meta description</span>
                <textarea
                  rows={4}
                  value={seo.pageDescription}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, pageDescription: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Slug</span>
                <input
                  value={seo.slug}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, slug: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Primary keyword</span>
                <input
                  value={seo.primaryKeyword}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, primaryKeyword: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span className="block font-medium text-white">Canonical URL</span>
                <input
                  value={seo.canonicalUrl}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, canonicalUrl: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span className="block font-medium text-white">Open Graph image</span>
                <input
                  value={seo.ogImage}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, ogImage: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportSeoPack}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Download SEO pack
              </button>
            </div>

            <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">SEO score</span>
                <span className="text-white">{seoChecks.score}/100</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Title length</span>
                <span className="text-white">{seoChecks.titleLength} characters</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Description length</span>
                <span className="text-white">{seoChecks.descriptionLength} characters</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className={`rounded-full px-3 py-1 ${seoChecks.keywordInTitle ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}
                >
                  Keyword in title: {seoChecks.keywordInTitle ? "yes" : "no"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 ${seoChecks.keywordInDescription ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}
                >
                  Keyword in description: {seoChecks.keywordInDescription ? "yes" : "no"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80">
                04. Design Starter
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Quick web design building blocks
              </h2>
            </div>

            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Hero palette",
                  value: "Electric cyan + slate",
                  note: "Clean contrast for a utility-focused brand.",
                  accent: "from-cyan-400 to-sky-500",
                },
                {
                  title: "Section style",
                  value: "Glass cards",
                  note: "Keeps the interface modern while remaining readable.",
                  accent: "from-violet-400 to-fuchsia-500",
                },
                {
                  title: "Type rhythm",
                  value: "Large heading scale",
                  note: "Supports landing pages, tool instructions, and SEO copy.",
                  accent: "from-emerald-400 to-lime-500",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/[0.07]"
                >
                  <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${item.accent}`} />
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{item.note}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-medium text-cyan-200">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                Recommended first release
              </p>
              <ol className="mt-4 space-y-3 text-sm text-slate-300">
                <li>1. Image reducer with JPG, PNG, and WebP export.</li>
                <li>2. Metadata and geotag sidecar editor for image uploads.</li>
                <li>3. SEO helpers for title, description, and social preview text.</li>
                <li>4. Design starter cards for color, typography, and section styling.</li>
              </ol>
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-cyan-400/10 p-5 text-sm text-cyan-100">
              This first build is intentionally lightweight and browser-first. If you want, the next
              step is to add true EXIF writing, batch image processing, or a backend for saved SEO
              projects.
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the selected image."));
    image.src = src;
  });
}
