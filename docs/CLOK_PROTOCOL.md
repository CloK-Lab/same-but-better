# CloK project documentation protocol v1

A project owns its documentation and source code. CloK reads a public repository
at a recorded commit and provides the navigation, styling, and document renderer.
The protocol does not require Lean, Astro, or a separately deployed project site.
This specification and the shared format validator are licensed under Apache-2.0.

## Repository contract

Put `clok.json` at the repository root:

```json
{
  "$schema": "./docs/clok.schema.json",
  "schemaVersion": 1,
  "project": {
    "slug": "example",
    "title": "Example",
    "description": "A short description of the project."
  },
  "docs": {
    "format": "mdx",
    "entry": "docs/Overview.mdx",
    "include": ["docs/pages/**/*.mdx", "Examples/**/Note.mdx"]
  }
}
```

`project.slug` is a stable, lowercase hyphenated identifier, unique among published
projects. It owns `/docs/<slug>`. The title and description come from the project;
the website does not keep another copy. Unknown versions and unknown manifest
fields fail validation. `$schema` is optional and provides editor assistance;
the importer always uses its own validator and never downloads a supplied schema.

Optional `project.category` is a nonempty label for the project's subject or
purpose, such as `Learning code verification`. Explore displays it after `BUILD`;
projects that omit it retain the `Documentation` label.

`docs.entry` is the overview, with no frontmatter: its metadata comes from
`project`. `docs.include` selects additional Markdown or MDX pages. Patterns
support `*` within a filename and `**` as a whole directory segment, matching zero
or more levels. Brace expansion, exclusions, and arbitrary glob syntax are not
part of v1. The entry is excluded from discovery even if a pattern matches it.
Paths are relative to the repository; hidden paths, parent traversal, and symlinks
are not imported. Each imported text file and image may be at most 2 MiB.

Legacy `notebook.json` remains supported by CloK. A repository must contain only
one of the two manifests. New projects use `clok.json`; migration preserves the
project slug and page slugs, so published addresses remain unchanged.

## Pages and navigation

Each selected page has frontmatter:

```yaml
---
title: Installation
description: Set up the project locally.
slug: guides/install
order: 1
section: Getting started
draft: false
---
```

`title`, `description`, `slug`, and positive integer `order` are required.
`section` and `draft` are optional. Each slash-separated slug segment uses
lowercase letters, numbers and hyphens. The full slug is unique within the
project; `overview` is reserved. A page is served at
`/docs/<project-slug>/<page-slug>`, independently of its source filename.

Pages sort by `order`, then slug. Consecutive pages with the same `section` share
a sidebar heading; use contiguous order values for each section. Drafts do not
appear in navigation or publication. Relative links to missing or draft pages
fail the build. Both `.md` and `.mdx` links are rewritten to their public routes;
heading fragments are preserved. The layout supplies the page title.

## Content and rendering

Supported content includes Markdown tables, lists, footnotes, images, inline and
display math, fenced code in the renderer's supported languages, and these
host-provided components:

- `Callout`, `Tabs`, `Tab`, `Steps`, `Step`, and `Badge`.
- `CodePreview`: visible initial lines with a fade; click or press Enter/Space to
  expand and collapse. Selecting and copying do not toggle the area.
- Mathematical `definition`, `theorem`, `lemma`, and `proof` environments, written
  as standalone `\begin{...}` / `\end{...}` lines outside math delimiters.

Definition, theorem, and lemma numbering is shared within a page. Proofs are
unnumbered. Component props are literals. Imports, exports, arbitrary JavaScript,
event handlers, custom scripts, and project styles are outside the v1 contract.
The host owns the components and never runs a submitted repository's build scripts.

Relative PNG, JPEG, WebP, GIF, AVIF, and SVG images are copied from the same commit.
External image URLs remain external. Relative documentation links must target
published pages; link to GitHub when referring to repository files such as README.

Lean source excerpts are an optional capability, not a project requirement:

````mdx
```lean4 file="./Verification/Performance.lean" declaration="countedMap_spec"
```
````

The empty fence imports the named declaration and its proof with its source path
and original line range. Omit `declaration` to import the whole file. Named
excerpts support declarations at column zero with indented bodies and trailing
`where`, `termination_by`, and `decreasing_by` clauses. Missing or ambiguous names
fail the build. Ordinary code fences support every highlighted language available
in the renderer; other source languages do not yet have named-excerpt extraction.

## Validation and ownership

`tools/clok-docs-format.mjs` is the v1 metadata validator, mirrored by the host's
`scripts/project-docs-format.mjs`. `docs/clok.schema.json` supplies editor hints.
The host copy is authoritative at publication; repository changes cannot weaken
its checks. The host additionally checks MDX syntax, permitted components, source
excerpts, document links, and assets. A project can use any local preview tool
that produces compatible content.

In this example repository, `npm run check:docs` checks the manifest and page
metadata; `npm run build` also compiles the local preview. `lake build` checks the
Lean proofs independently. Other projects use their own code checks.

CloK derives Explore entries from admitted, compiled v1 projects whose GitHub
owner matches the website organization. Their titles, descriptions and document
URLs come from the manifest. Being discoverable through the protocol does not
itself publish a repository: it first goes through the submission/version record.
Non-organization repositories can use the same document format and submission
process, but do not automatically become organization projects in Explore.

## Publishing and updates

The existing path remains:

```text
public repository + license + commit
  → submission/version PR
  → submissions.json
  → stores.config.mjs
  → build-stores.mjs
  → compiled document data
  → /docs/<project> and Explore
```

No source checkout is read at request time. A deployment reads its pinned commit,
not the moving `main` branch. A failed import prevents the new deployment; the
previous deployment remains available. A rollback redeploys a previous website
revision (including its submission record).

The website's `Sync project documentation` workflow runs hourly and can also be
started manually. It updates already registered organization projects; the manual
`repository` input can onboard a new one. It accepts public, non-fork organization
repositories using Apache-2.0 and `clok.json`. All latest push workflows for the
exact default-branch commit must have completed successfully. The host then
validates the acquired documentation and creates or updates a PR changing only
`submissions.json`. Website CI and its deployment preview must pass before merge.
Automatic merging is not enabled by the protocol.

To enable this workflow, configure `CLOK_DOCS_APP_ID` as a website repository
variable and `CLOK_DOCS_APP_PRIVATE_KEY` as a secret. Install the GitHub App on the
website repository with Contents and Pull requests write permissions. Public
project metadata and CI status are read through the GitHub API; source clones do
not use credentials. Without the App ID, the scheduled job is skipped. Projects
need no copy of the website token or a separate cross-repository webhook.

An administrator can first inspect a proposed update locally in the website:

```sh
node scripts/sync-project-docs.mjs --owner CloK-Lab --repo CloK-Lab/example
```

This validates the source and edits the version record locally; it neither pushes
nor deploys. The workflow turns that edit into the standard publication PR.

## Compatibility

Changes that keep existing v1 repositories valid may extend the renderer.
Removing fields or component capabilities requires a new protocol version and an
explicit migration. Keep existing v1 fixtures in host CI. Multi-version readers,
search, localization, and custom project applications can be considered separately;
they are not implied by this documentation protocol.
