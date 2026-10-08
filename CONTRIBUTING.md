# Contributing a small case

A clear, reproducible example is enough to contribute. Improvements to existing
explanations, counterexamples, and experiments are welcome too.

Write project documentation in English.

The site is a learning notebook. State the required behavior mathematically,
prove that each implementation meets it, then compare costs under an explicit model. Use `Note.mdx` for the
reading version, following the [authoring guide](docs/README.md). Notes are
discovered automatically; there is no hand-maintained website navigation list.

## What to include

- **Specification and implementations:** State the required output, input domain, and assumptions before presenting alternatives.
- **Equivalence scope:** Which behavior is compared? What assumptions and edge cases matter?
- **Evidence:** Lean proofs, performance experiments, or clearly labeled open questions.
- **Costs and trade-offs:** Which metric improves? Does another cost increase?
- **Reproduction:** Commands, environment requirements, and expected results.

Cases can cover more than UI code. An optimization that fails, or a counterexample
to a proposed equivalence, can be just as useful as a successful improvement.

## One folder per code snippet

Put everything in `SameButBetter/<CaseName>/`, following `MapFusion`:

```text
<CaseName>/
  README.md          # Problem, version descriptions, assumptions, and conclusions
  Note.mdx           # Learning narrative for the MDX notebook
  VersionA.lean      # First implementation
  VersionB.lean      # Second implementation
  Verification/
    Specification.lean # Common output requirement
    Equivalence.lean   # Correctness and equivalence proofs
    Performance.lean   # Cost model and comparison proofs
```

Use `VersionC.lean`, `VersionD.lean`, and so on for additional implementations.
Only add a version file when there is an actual implementation. Use matching
names in code, such as `versionA` and `versionB`, and describe each algorithm in
its file's documentation. Letters identify versions, not a performance ranking.

Keep the specification independent of implementation choices. Put implementations
in the version files and their correctness proofs in `Verification/Equivalence.lean`. When the
specification determines a unique output, derive equivalence from correctness.
Put counted executions, their correspondence to the versions, and cost comparisons
in `Verification/Performance.lean`. State the metric and assumptions. Extend correctness and
cost proofs when adding an implementation.

Keep explanations, benchmark code, and raw results in this same case folder.
Clearly label any missing proofs or measurements in its README.
Import both proof modules in `SameButBetter.lean` so `lake build` checks them,
and add the snippet to the root README table. No executable demo is required.

Keep each case small; a general framework or new dependency is not required.

## Before submitting

```sh
lake build
git diff --check
```

For notebook or site changes, also run `npm ci` and `npm run build`. The MDX site
imports Lean source for display; its build does not check the Lean proofs.

Included Lean proofs must pass checking without proof placeholders or axioms that
assume the claim being proved. Unfinished arguments can live in case notes or an
issue, clearly marked as open questions.

Distinguish modeled operation counts from measured runtime. Measurements should
include commands, inputs, toolchain, and hardware details. Do not generalize one
measurement into a guarantee for every environment.

If Lean verifies a model of external code, explain the correspondence and identify
any connections that have not been proved.
