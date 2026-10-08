import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import { fileURLToPath } from 'node:url';
import { leanExcerpt } from './lean-excerpt.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

/** Local preview of the portable empty code-fence source convention. */
export default function remarkSource() {
  return async (tree, file) => {
    async function rewriteLink(url) {
      if (/^(?:#|\/|[a-z][a-z\d+.-]*:)/i.test(url)) return url;
      const [pathname] = url.split(/[?#]/);
      if (!pathname.endsWith('.mdx')) return url;
      const target = await fs.realpath(path.resolve(path.dirname(file.path), decodeURIComponent(pathname)));
      const relative = path.relative(root, target);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Document link leaves the repository: ${url}`);
      const hash = url.includes('#') ? `#${url.split('#').slice(1).join('#')}` : '';
      if (relative === 'docs/Overview.mdx') return `/${hash}`;
      const text = await fs.readFile(target, 'utf8');
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1];
      const meta = parse(frontmatter ?? '') ?? {};
      if (!meta.slug || meta.draft) throw new Error(`Document link targets a missing or draft page: ${url}`);
      return `/notes/${meta.slug}/${hash}`;
    }
    async function walk(node) {
      if (node.type === 'link' || node.type === 'definition') node.url = await rewriteLink(node.url);
      if ((node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') && node.name === 'a') {
        const href = node.attributes.find(attribute => attribute.name === 'href');
        if (href && typeof href.value === 'string') href.value = await rewriteLink(href.value);
      }
      if (node.type === 'code' && /^(lean|lean4)$/.test(node.lang)
          && /^file="\.[^"]+"(?: declaration="[\w.']+")?$/.test(node.meta ?? '')) {
        const [, relative, declaration] = /^file="([^"]+)"(?: declaration="([^"]+)")?$/.exec(node.meta);
        const source = await fs.realpath(path.resolve(path.dirname(file.path), relative));
        const within = path.relative(root, source);
        if (!relative.startsWith('./') || within.startsWith('..') || path.isAbsolute(within)
            || !source.endsWith('.lean') || node.value.trim()) {
          throw new Error(`Invalid source include in ${file.path}: ${relative}`);
        }
        const text = await fs.readFile(source, 'utf8');
        const excerpt = declaration ? leanExcerpt(text, declaration) : null;
        node.value = excerpt?.code ?? text.trimEnd();
        node.meta = `title="${relative.slice(2)}${excerpt ? `:${excerpt.first}–${excerpt.last}` : ''}"`;
      }
      if (node.children) await Promise.all(node.children.map(walk));
    }
    await walk(tree);
  };
}
