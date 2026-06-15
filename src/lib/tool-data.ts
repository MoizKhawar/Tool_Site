export type ToolSlug = "image-tool" | "metadata-tool" | "seo-design-tool";

export type ToolEntry = {
  slug: ToolSlug;
  href: string;
  title: string;
  shortTitle: string;
  description: string;
  badge: string;
  navLabel: string;
  accent: string;
};

export const tools: ToolEntry[] = [
  {
    slug: "image-tool",
    href: "/image-tool",
    title: "Image reducer and format changer",
    shortTitle: "Image tool",
    description: "Resize images and export as JPG, PNG, or WebP in a focused editor.",
    badge: "Most used",
    navLabel: "Image tool",
    accent: "text-cyan-300",
  },
  {
    slug: "metadata-tool",
    href: "/metadata-tool",
    title: "Image metadata and geotag editor",
    shortTitle: "Metadata",
    description: "Edit title, author, keywords, and location data and export a sidecar JSON pack.",
    badge: "File info",
    navLabel: "Metadata",
    accent: "text-cyan-300",
  },
  {
    slug: "seo-design-tool",
    href: "/seo-design-tool",
    title: "SEO and website design helpers",
    shortTitle: "SEO + design",
    description: "Tune page metadata and keep quick design notes for landing pages and sections.",
    badge: "Website",
    navLabel: "SEO + design",
    accent: "text-cyan-300",
  },
];

export function getToolBySlug(slug: ToolSlug) {
  return tools.find((tool) => tool.slug === slug);
}
