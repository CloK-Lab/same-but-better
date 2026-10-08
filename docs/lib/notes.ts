import type { MDXInstance } from 'astro';
import { readProjectDocs } from '../../tools/clok-docs-format.mjs';

// Content location is chosen by clok.json; these globs only load candidate modules.
const sources = import.meta.glob<string>(
  ['../../**/*.mdx', '../../**/*.md', '!../../node_modules/**', '!../../dist/**', '!../../.*/**'],
  { eager: true, query: '?raw', import: 'default' },
);
const modules = import.meta.glob<MDXInstance<Record<string, unknown>>>(
  ['../../**/*.mdx', '../../**/*.md', '!../../node_modules/**', '!../../dist/**', '!../../.*/**'],
  { eager: true },
);
import manifest from '../../clok.json';
const relative = (source: string) => {
  const parts = ['docs', 'lib'];
  for (const part of source.split('/')) {
    if (part === '..') parts.pop();
    else if (part !== '.') parts.push(part);
  }
  return parts.join('/');
};
const loaded = new Map(Object.entries(modules).map(([source, module]) => [relative(source), module]));
const files = new Map(Object.entries(sources).map(([source, text]) => [relative(source), text]));
files.set('clok.json', JSON.stringify(manifest));
export const project = readProjectDocs(files);
interface Page { source: string; slug: string; title: string; description: string; section?: string }
export const pages = (project.pages as Page[]).map(page => ({
  ...page,
  module: loaded.get(page.source)!,
  href: page.slug === 'overview' ? '/' : `/notes/${page.slug}/`,
}));
export const overview = pages[0];
export const notes = pages.slice(1);
