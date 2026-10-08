# Map fusion

Two implementations of the same pointwise list transformation, with correctness
proofs against a common specification and a comparison of list-cell visit counts.

Read the [note](Note.mdx) for the mathematical specification and analysis.

| File | Purpose |
| --- | --- |
| [Specification.lean](Verification/Specification.lean) | Output specification and uniqueness |
| [VersionA.lean](VersionA.lean) | Two successive maps |
| [VersionB.lean](VersionB.lean) | One map of the composed function |
| [Equivalence.lean](Verification/Equivalence.lean) | Correctness of both implementations and their equivalence |
| [Performance.lean](Verification/Performance.lean) | Counted executions, result correspondence, and cost comparison |

Run `lake build` from the repository root to check all proofs. For an input of
length $n$, the modeled visit counts are $2n$ and $n$; these are not measurements
of runtime or memory usage.
