# Contributing a small case

A clear, reproducible example is enough to contribute. Improvements to existing
explanations, counterexamples, and experiments are welcome too.

Write project documentation in English.

## What to include

- **Problem and implementations:** What should the code do, and what are the alternatives?
- **Equivalence scope:** Which behavior is compared? What assumptions and edge cases matter?
- **Evidence:** Lean proofs, performance experiments, or clearly labeled open questions.
- **Costs and trade-offs:** Which metric improves? Does another cost increase?
- **Reproduction:** Commands, environment requirements, and expected results.

Cases can cover more than UI code. An optimization that fails, or a counterexample
to a proposed equivalence, can be just as useful as a successful improvement.

## Where things go

- Lean implementations and proofs: `SameButBetter/Cases/<CaseName>/`.
- Explanations and experiment materials: `examples/<case-name>/`.
- Import compilable cases in `SameButBetter.lean` and add them to the README case table.

Use `MapFusion` as a starting point. Keep each case small; a general framework or
new dependency is not required to contribute an example.

## Before submitting

```sh
lake build
lake exe demo
git diff --check
```

Included Lean proofs must pass checking without proof placeholders or axioms that
assume the claim being proved. Unfinished arguments can live in case notes or an
issue, clearly marked as open questions.

Distinguish modeled operation counts from measured runtime. Measurements should
include commands, inputs, toolchain, and hardware details. Do not generalize one
measurement into a guarantee for every environment.

If Lean verifies a model of external code, explain the correspondence and identify
any connections that have not been proved.
