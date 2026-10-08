// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';

export function projectFiles(root) {
  const files = new Map();
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['node_modules', 'dist'].includes(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() && (entry.name === 'clok.json' || /\.(md|mdx|lean)$/.test(entry.name))) {
        files.set(path.relative(root, absolute).split(path.sep).join('/'), fs.readFileSync(absolute, 'utf8'));
      }
    }
  }
  walk(root);
  return files;
}
