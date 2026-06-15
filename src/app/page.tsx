import Link from "next/link";

const toolCards = [
  {
    href: "/image-tool",
    title: "Image reducer and format changer",
    description: "Resize images and export as JPG, PNG, or WebP in a focused editor.",
    badge: "Most used",
  },
  {
    href: "/metadata-tool",
    title: "Image metadata and geotag editor",
    description: "Edit title, author, keywords, and location data and export a sidecar JSON pack.",
    badge: "File info",
  },
  {
    href: "/seo-design-tool",
    title: "SEO and website design helpers",
    description: "Tune page metadata and keep quick design notes for landing pages and sections.",
    badge: "Website",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
        <div className="space-y-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">ToolForge</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            A focused website for image tools, metadata editing, and fast SEO utilities.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Each tool now lives on its own page, so the interface stays clear and users can jump
            straight to the task they need.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/image-tool"
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Open image tool
            </Link>
            <Link
              href="/seo-design-tool"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              View SEO tools
            </Link>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-cyan-300/15 bg-slate-950/40 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span>Image tool</span>
            <span className="text-cyan-300">Squoosh-style UI</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span>Metadata tool</span>
            <span className="text-cyan-300">Geotag export</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span>SEO + design</span>
            <span className="text-cyan-300">Quick planning</span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {toolCards.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/80">
                {tool.badge}
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition group-hover:text-white">
                Open
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-white">{tool.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{tool.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
