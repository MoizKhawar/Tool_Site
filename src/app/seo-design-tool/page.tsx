"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SeoDraft = {
  pageTitle: string;
  pageDescription: string;
  canonicalUrl: string;
  slug: string;
  primaryKeyword: string;
  ogImage: string;
  palette: string;
  sectionStyle: string;
  tone: string;
};

const initialSeo: SeoDraft = {
  pageTitle: "ToolForge - Image, SEO and Design Utilities",
  pageDescription:
    "Resize images, change formats, edit geotags and metadata, and preview clean SEO snippets in one toolbox.",
  canonicalUrl: "https://yourdomain.com",
  slug: "/",
  primaryKeyword: "image tools",
  ogImage: "https://yourdomain.com/og-image.png",
  palette: "Electric cyan + slate",
  sectionStyle: "Glass cards",
  tone: "Practical, clean, and direct",
};

function scoreValue(value: string, min: number, max: number) {
  const length = value.trim().length;

  if (!length) {
    return 0;
  }

  if (length < min) {
    return Math.round((length / min) * 60);
  }

  if (length > max) {
    return Math.max(40, 100 - Math.min(40, length - max));
  }

  return 100;
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

export default function SeoDesignToolPage() {
  const [seo, setSeo] = useState<SeoDraft>(initialSeo);

  const checks = useMemo(() => {
    const keywordInTitle = seo.pageTitle.toLowerCase().includes(seo.primaryKeyword.toLowerCase());
    const keywordInDescription = seo.pageDescription
      .toLowerCase()
      .includes(seo.primaryKeyword.toLowerCase());
    const score = Math.round(
      (scoreValue(seo.pageTitle, 30, 60) +
        scoreValue(seo.pageDescription, 120, 160) +
        (keywordInTitle ? 100 : 45) +
        (keywordInDescription ? 100 : 60)) /
        4,
    );

    return {
      score,
      titleLength: seo.pageTitle.trim().length,
      descriptionLength: seo.pageDescription.trim().length,
      keywordInTitle,
      keywordInDescription,
    };
  }, [seo]);

  function exportSeoPack() {
    downloadJson("seo-pack.json", {
      title: seo.pageTitle,
      description: seo.pageDescription,
      canonicalUrl: seo.canonicalUrl,
      slug: seo.slug,
      primaryKeyword: seo.primaryKeyword,
      ogImage: seo.ogImage,
      palette: seo.palette,
      sectionStyle: seo.sectionStyle,
      tone: seo.tone,
    });
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">SEO + design</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Website SEO and design helpers</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          Tune page titles, descriptions, and visual direction in a live workspace that feels like a practical planning board instead of a placeholder.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ["SEO score", `${checks.score}/100`, "Title, description, and keyword checks"],
            ["Design tokens", seo.palette, "Palette and section style"],
            ["Preview pack", "Downloadable JSON", "Open Graph and sharing values"],
          ].map(([title, value, text]) => (
            <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <div className="mt-2 text-sm font-medium text-cyan-200">{value}</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4 rounded-[1.75rem] border border-cyan-300/15 bg-slate-950/70 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Palette</span>
                <input
                  value={seo.palette}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, palette: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block font-medium text-white">Section style</span>
                <input
                  value={seo.sectionStyle}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, sectionStyle: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                <span className="block font-medium text-white">Tone</span>
                <input
                  value={seo.tone}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, tone: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportSeoPack}
                className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Export SEO pack
              </button>
            </div>
          </div>

          <aside className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Title length</span>
                <span className="text-white">{checks.titleLength} characters</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-slate-400">Description length</span>
                <span className="text-white">{checks.descriptionLength} characters</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span
                  className={`rounded-full px-3 py-1 ${checks.keywordInTitle ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}
                >
                  Keyword in title: {checks.keywordInTitle ? "yes" : "no"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 ${checks.keywordInDescription ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}
                >
                  Keyword in description: {checks.keywordInDescription ? "yes" : "no"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
              {[
                ["Hero direction", seo.palette],
                ["Section rhythm", seo.sectionStyle],
                ["Writing tone", seo.tone],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-cyan-300/15 bg-cyan-400/10 p-5 text-sm text-cyan-100">
              This page now behaves like a live planning tool: change copy, test keyword placement, and export the values for your site build.
            </div>
          </aside>
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
