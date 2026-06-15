import Link from "next/link";

export default function SeoDesignToolPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">SEO + design</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Website SEO and design helpers</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          Use this page for page-title tuning, description checks, and small design decisions like palette, section style, and hierarchy.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ["SEO score", "Title length, description length, keyword presence"],
            ["Design tokens", "Palette, spacing, and section styling"],
            ["Preview pack", "Open Graph title, URL, and share image"],
          ].map(([title, text]) => (
            <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-cyan-300/15 bg-cyan-400/10 p-5 text-sm text-cyan-100">
          This page can be expanded with live title and description checks or a content editor later.
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
          <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/[0.08] hover:text-white">Back to home</Link>
          <Link href="/image-tool" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/[0.08] hover:text-white">Open image tool</Link>
        </div>
      </section>
    </main>
  );
}
