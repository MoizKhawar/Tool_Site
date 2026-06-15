"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type MetadataForm = {
  title: string;
  author: string;
  description: string;
  keywords: string;
  location: string;
  latitude: string;
  longitude: string;
  copyright: string;
};

type FileEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
};

const initialMetadata: MetadataForm = {
  title: "Homepage hero image",
  author: "",
  description: "Optimized image for the landing page.",
  keywords: "website, hero, conversion, marketing",
  location: "",
  latitude: "",
  longitude: "",
  copyright: "",
};

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function createFileId(file: File, index: number) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}

function downloadJson(fileName: string, value: unknown) {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadText(fileName: string, value: string, type: string) {
  const blob = new Blob([value], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function MetadataToolPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [metadata, setMetadata] = useState<MetadataForm>(initialMetadata);
  const [statusText, setStatusText] = useState("Upload one or more images to start.");

  const geoLink = useMemo(() => {
    if (!metadata.latitude || !metadata.longitude) {
      return null;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(`${metadata.latitude},${metadata.longitude}`)}`;
  }, [metadata.latitude, metadata.longitude]);

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const nextFiles = Array.from(selectedFiles).map((file, index) => ({
      id: createFileId(file, index),
      name: file.name,
      size: file.size,
      type: file.type || "image/unknown",
    }));

    setFiles((current) => [...current, ...nextFiles]);
    setStatusText(`${nextFiles.length} file${nextFiles.length > 1 ? "s" : ""} added.`);
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((entry) => entry.id !== id));
  }

  function clearFiles() {
    setFiles([]);
    setStatusText("File list cleared.");
  }

  function exportMetadataPack() {
    if (files.length === 0) {
      setStatusText("Add at least one file before exporting.");
      return;
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      sharedMetadata: {
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
      },
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        outputName: file.name.replace(/\.[^.]+$/, "") + "-metadata.json",
      })),
    };

    downloadJson(`${metadata.title.trim().toLowerCase().replace(/\s+/g, "-") || "metadata"}-pack.json`, payload);
    setStatusText("Metadata pack exported.");
  }

  function exportCsv() {
    if (files.length === 0) {
      setStatusText("Add at least one file before exporting CSV.");
      return;
    }

    const header = ["file_name", "title", "author", "location", "latitude", "longitude", "keywords"];
    const rows = files.map((file) =>
      [
        file.name,
        metadata.title,
        metadata.author,
        metadata.location,
        metadata.latitude,
        metadata.longitude,
        metadata.keywords,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );

    downloadText(`metadata-${Date.now()}.csv`, [header.join(","), ...rows].join("\n"), "text/csv");
    setStatusText("CSV export created.");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1">
            Metadata tool
          </span>
          <span className="text-slate-300">Batch upload, geotag, and export</span>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-inner shadow-black/20">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-medium text-white">Upload images</p>
                  <p className="text-sm text-slate-400">
                    Add multiple files and export the same metadata set for all of them.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearFiles}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <label className="mt-5 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-6 text-center transition hover:border-cyan-300/40 hover:bg-white/[0.08]">
                <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">
                  Drag and drop files
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">Metadata batch</div>
                <div className="mt-2 max-w-md text-sm text-slate-400">
                  JPG, PNG, and WebP files can all share the same title, author, location, and
                  keyword set.
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => handleFiles(event.target.files)}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {files.length > 0 ? (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">{file.name}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                          {formatBytes(file.size)} · {file.type}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-400 sm:col-span-2">
                  No files selected yet.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5 rounded-[1.75rem] border border-cyan-300/15 bg-slate-950/40 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Title", "title"],
                ["Author", "author"],
                ["Location", "location"],
                ["Copyright", "copyright"],
              ].map(([label, field]) => (
                <label key={field} className="space-y-2 text-sm text-slate-300">
                  <span className="block font-medium text-white">{label}</span>
                  <input
                    value={metadata[field as keyof MetadataForm]}
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

            <label className="space-y-2 text-sm text-slate-300">
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

            <label className="space-y-2 text-sm text-slate-300">
              <span className="block font-medium text-white">Keywords</span>
              <input
                value={metadata.keywords}
                onChange={(event) =>
                  setMetadata((current) => ({ ...current, keywords: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Latitude</span>
                <input
                  value={metadata.latitude}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, latitude: event.target.value }))
                  }
                  placeholder="40.7128"
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
                  placeholder="-74.0060"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Geotag status</span>
                <span className="text-white">{geoLink ? "Ready" : "Add coordinates"}</span>
              </div>
              {geoLink ? (
                <a
                  href={geoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-cyan-200 underline decoration-cyan-300/40 underline-offset-4"
                >
                  Open in Maps
                </a>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportMetadataPack}
                className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Export JSON pack
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Export CSV
              </button>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {statusText}
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Batch ready", "Apply one metadata set to many images."],
            ["Geotag friendly", "Store coordinates and an open-map link."],
            ["Exportable", "Download JSON or CSV for later embedding."],
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
            href="/image-tool"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/[0.08] hover:text-white"
          >
            Open image tool
          </Link>
        </div>
      </section>
    </main>
  );
}
