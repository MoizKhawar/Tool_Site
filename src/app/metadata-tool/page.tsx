import Link from "next/link";

export default function MetadataToolPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">Metadata tool</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Image metadata and geotag editor</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          This page can be expanded later for EXIF writing and batch metadata work. For now it keeps a simple file-info workflow and export-ready metadata planning.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Title", "Homepage hero image"],
            ["Author", "Creator name"],
            ["Location", "City, Country"],
            ["Latitude / Longitude", "Geo coordinates"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-medium text-white">{label}</div>
              <div className="mt-2 text-sm text-slate-400">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          Suggested next step: add image upload, metadata fields, and a JSON sidecar download here.
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
          <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/[0.08] hover:text-white">Back to home</Link>
          <Link href="/image-tool" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/[0.08] hover:text-white">Open image tool</Link>
        </div>
      </section>
    </main>
  );
}
