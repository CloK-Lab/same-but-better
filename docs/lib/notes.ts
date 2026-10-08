import type { MDXInstance } from 'astro';

interface NoteMeta {
  title: string;
  description: string;
  slug: string;
  order: number;
  topic: string;
  draft?: boolean;
}

const modules = import.meta.glob<MDXInstance<NoteMeta>>(
  '../../SameButBetter/**/Note.mdx', { eager: true },
);
const slugs = new Set<string>();
export const notes = Object.entries(modules).map(([path, module]) => {
  const meta = module.frontmatter;
  for (const key of ['title', 'description', 'slug', 'topic'] as const) {
    if (typeof meta[key] !== 'string' || !meta[key].trim()) {
      throw new Error(`${path}: missing ${key}`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug) || slugs.has(meta.slug)) {
    throw new Error(`${path}: invalid or duplicate slug ${meta.slug}`);
  }
  if (!Number.isInteger(meta.order) || meta.order < 1) {
    throw new Error(`${path}: order must be a positive integer`);
  }
  if (meta.draft !== undefined && typeof meta.draft !== 'boolean') {
    throw new Error(`${path}: draft must be a boolean`);
  }
  slugs.add(meta.slug);
  return { ...meta, module, href: `/notes/${meta.slug}/` };
}).filter(note => !note.draft).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
