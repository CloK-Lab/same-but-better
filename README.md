# same-but-better

We study and collect equivalent code with better performance, developing formal
verification alongside each example.

Each case states a **specification**, gives implementations named **Version A,
Version B, Version C, ...**, and proves their correctness before comparing costs.
Source files and the explanatory note share one folder. Version letters identify
alternatives; they do not imply a ranking.

## Read and write the notebook

The reading site uses MDX. Each case keeps its `Note.mdx` next to the Lean source;
the site discovers notes automatically and renders imported source files directly.
The first entry is [Map fusion](SameButBetter/MapFusion/Note.mdx).

With Node.js 22.12 or newer, run:

```sh
npm ci
npm run dev
```

Open `http://localhost:4321`. `npm run build` checks the site and generates static
files in `dist/`; `npm run preview` previews that build locally. Building the
notebook does not require Lean, and building the proofs does not require Node.js.

See [the notebook authoring guide](docs/README.md) to add an entry. The site follows
the local CloK website's palette, typography, and reading layout, with self-hosted
fonts and no dependency on that checkout.

## Getting started

Install [elan, the Lean toolchain manager](https://github.com/leanprover/elan#installation), then run:

```sh
git clone https://github.com/CloK-Lab/same-but-better.git
cd same-but-better
lake build
```

The project pins **Lean 4.34.0** and currently uses only the Lean standard library.
`lake build` compiles the implementations and checks the specification and proofs.
To explore proofs interactively, open this directory in VS Code with the Lean 4 extension.

## Cases

| Snippet | Version A | Version B | Equivalence proof | Performance proof |
| --- | --- | --- | --- | --- |
| [Map fusion](SameButBetter/MapFusion/README.md) | [Two passes](SameButBetter/MapFusion/VersionA.lean) | [One pass](SameButBetter/MapFusion/VersionB.lean) | [A = B for finite lists and pure functions](SameButBetter/MapFusion/Verification/Equivalence.lean) | [List-cell visits: A = `2n`, B = `n`](SameButBetter/MapFusion/Verification/Performance.lean) |

Map fusion currently has two versions. Runtime and memory use have not yet been measured.

“Better” depends on the metric and the assumptions. One implementation may run
faster while another uses less memory. Some improvements only pay off at certain
input sizes. Each case should explain these trade-offs.

## Reading a case

1. Read the mathematical specification in `Note.mdx` and its definition in `Verification/Specification.lean`.
2. Compare `VersionA.lean`, `VersionB.lean`, and any additional versions.
3. Read `Verification/Equivalence.lean`: each implementation satisfies the specification, yielding equal outputs.
4. Read `Verification/Performance.lean`: the cost model, its correspondence to the implementations, and the comparison proofs.
5. Run `lake build` to check the proofs.

We distinguish **proved claims, measured observations, and open questions**.
A proof about operation counts is not a proof about elapsed time on real hardware.
Equivalence between two Lean models also does not automatically establish
equivalence between programs written in another language.

## Structure

```text
SameButBetter/
  MapFusion/               # One folder per code snippet
    README.md              # Problem, version comparison, and conclusions
    Note.mdx               # Learning note, with live source imports
    VersionA.lean          # A: two passes
    VersionB.lean          # B: one fused pass
    Verification/
      Specification.lean   # Required output and uniqueness
      Equivalence.lean     # Correctness and equivalence
      Performance.lean     # Cost model and proofs
SameButBetter.lean           # Imports the proofs for all snippets
CONTRIBUTING.md              # How to add a snippet or a version
docs/                        # MDX site layouts, components, and authoring guide
```

Add `VersionC.lean` when a snippet has a third implementation, and extend both
proof files to cover it. Benchmarks and their results also belong in the snippet folder.

## Contributing

A small example, a clearer explanation, a proof, a counterexample, or a reproducible
performance experiment is a useful contribution. A case does not need to cover
every dimension at once. See [CONTRIBUTING.md](CONTRIBUTING.md).

## CloK integration

`clok.json` declares this project’s documentation using [CloK protocol v1](docs/CLOK_PROTOCOL.md).
The website reads published revisions from this repository and supplies the shared
navigation and rendering. Run `npm run check:docs` to validate the manifest and page metadata.

## License

The code and documentation are licensed under [Apache-2.0](LICENSE).
