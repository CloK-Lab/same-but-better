// CloK project documentation protocol v1. Shared with the website importer.
// SPDX-License-Identifier: Apache-2.0
import { parse } from 'yaml';

const segment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const documentSlug = value => typeof value === 'string' && value.split('/').every(part => segment.test(part));
export const repositoryPath = value => typeof value === 'string' && value.length > 0
  && !/[\\:*?"<>|\u0000-\u001f]/.test(value)
  && value.split('/').every(part => part && !part.startsWith('.'));

function fields(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).some(key => !allowed.includes(key))) throw new Error(`Invalid ${label} fields`);
}

export function projectManifest(text) {
  const data = JSON.parse(text);
  fields(data, ['$schema', 'schemaVersion', 'project', 'docs'], 'clok.json');
  if (data.schemaVersion !== 1) throw new Error(`Unsupported clok.json schemaVersion: ${data.schemaVersion}`);
  if (data.$schema !== undefined && typeof data.$schema !== 'string') throw new Error('Invalid $schema');
  fields(data.project, ['slug', 'title', 'description'], 'project');
  const { slug, title, description } = data.project;
  if (typeof slug !== 'string' || !segment.test(slug) || typeof title !== 'string' || !title.trim()
      || typeof description !== 'string' || !description.trim()) throw new Error('Invalid project identity');
  fields(data.docs, ['format', 'entry', 'include'], 'docs');
  const { format, entry, include } = data.docs;
  if (format !== 'mdx' || !repositoryPath(entry) || !/\.mdx?$/.test(entry)
      || !Array.isArray(include) || !include.length || include.length > 32
      || include.some(pattern => typeof pattern !== 'string' || !/\.mdx?$/.test(pattern)
        || !/^[\w./*-]+$/.test(pattern)
        || pattern.split('/').some(part => !part || part.startsWith('.') || (part.includes('**') && part !== '**')))) {
    throw new Error('Invalid docs: expected mdx, an entry path, and repository-relative include patterns');
  }
  return data;
}

function matches(pattern, file) {
  const expression = pattern.split('/').map((part, index, all) => {
    if (part === '**') return '(?:[^/]+/)*';
    return part.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + (index < all.length - 1 ? '/' : '');
  }).join('');
  return new RegExp(`^${expression}$`).test(file);
}

export function projectPageFiles(manifest, paths) {
  return [...paths].filter(file => repositoryPath(file) && file !== manifest.docs.entry
    && manifest.docs.include.some(pattern => matches(pattern, file))).sort();
}

/** The same page metadata validation runs in author CI and in the host importer. */
export function readProjectDocs(files) {
  const manifest = projectManifest(files.get('clok.json') ?? '');
  const { project, docs } = manifest;
  const entry = files.get(docs.entry);
  if (entry === undefined) throw new Error(`Missing entry: ${docs.entry}`);
  const slugs = new Set(['overview']);
  const pages = projectPageFiles(manifest, files.keys()).map(source => {
    const text = files.get(source);
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
    if (!match) throw new Error(`${source}: missing frontmatter`);
    const meta = parse(match[1]);
    if (!meta || typeof meta.title !== 'string' || !meta.title.trim()
        || typeof meta.description !== 'string' || !documentSlug(meta.slug)
        || !Number.isInteger(meta.order) || meta.order < 1
        || (meta.draft !== undefined && typeof meta.draft !== 'boolean')
        || (meta.section !== undefined && (typeof meta.section !== 'string' || !meta.section.trim()))) {
      throw new Error(`${source}: invalid page metadata`);
    }
    if (slugs.has(meta.slug)) throw new Error(`${source}: duplicate page slug ${meta.slug}`);
    slugs.add(meta.slug);
    return { source, slug: meta.slug, title: meta.title, description: meta.description,
      order: meta.order, ...(meta.section ? { section: meta.section } : {}), draft: meta.draft === true,
      body: text.slice(match[0].length) };
  }).filter(page => !page.draft).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  // The entry uses project metadata, so authors need not maintain it twice.
  if (/^---\r?\n/.test(entry)) throw new Error(`${docs.entry}: entry metadata belongs in clok.json`);
  return { protocolVersion: 1, ...project, pages: [
    { source: docs.entry, slug: 'overview', title: project.title, description: project.description, body: entry },
    ...pages,
  ] };
}
