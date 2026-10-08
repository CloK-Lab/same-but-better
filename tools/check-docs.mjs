// SPDX-License-Identifier: Apache-2.0
import { readProjectDocs } from './clok-docs-format.mjs';
import { projectFiles } from './project-files.mjs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const project = readProjectDocs(projectFiles(root));
console.log(`CloK docs v${project.protocolVersion}: ${project.slug}, ${project.pages.length} published pages`);
