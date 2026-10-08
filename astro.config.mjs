import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkSource from './docs/lib/remark-source.mjs';
import { expandMathEnvironments } from './docs/lib/math-environments.mjs';

const processor = unified({ remarkPlugins: [remarkSource, remarkMath], rehypePlugins: [[rehypeKatex, { strict: false }]] });
const createMdxRenderer = processor.createMdxRenderer.bind(processor);
processor.createMdxRenderer = async (...options) => {
  const renderer = await createMdxRenderer(...options);
  return { ...renderer, process: (content, ...args) => renderer.process(expandMathEnvironments(content), ...args) };
};

export default defineConfig({
  srcDir: './docs',
  publicDir: './docs/public',
  output: 'static',
  integrations: [mdx()],
  markdown: { processor, shikiConfig: { theme: 'github-dark', transformers: [{
    pre(node) {
      const meta = this.options.meta?.__raw ?? '';
      node.properties['data-title'] = /title="([^"]+)"/.exec(meta)?.[1] ?? '';
      node.properties['data-language'] = this.options.lang;
    },
    line(node, line) {
      const marked = /\{([\d,\s-]+)\}/.exec(this.options.meta?.__raw ?? '')?.[1] ?? '';
      if (marked.split(',').some(range => { const [first, last = first] = range.trim().split('-').map(Number); return line >= first && line <= last; })) {
        this.addClassToHast(node, 'highlighted');
      }
    },
  }] } },
  devToolbar: { enabled: false },
});
