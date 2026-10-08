# 001 · Map fusion: two traversals into one

To apply `f` and then `g` to every element of a list, we can use two traversals:

```lean
(xs.map f).map g
```

Or combine them into one:

```lean
xs.map (fun x => g (f x))
```

The implementations and proofs are in [Basic.lean](../../SameButBetter/Cases/MapFusion/Basic.lean).

## Scope of equivalence

Inputs are finite lists, and `f : α → β` and `g : β → γ` are pure Lean functions.
We compare the returned lists: both their elements and their order must match.

`equivalent` proves `baseline f g xs = optimized f g xs` for all such functions
and lists. The proof uses the standard library lemma `List.map_map`, which you can
inspect by jumping to its definition in the editor.

This claim does not directly cover callbacks with logging, exceptions, or mutable
state. In a strict execution model, two passes run all applications of `f` before
all applications of `g`; a fused pass interleaves them. Observable effects can
therefore change behavior. Applying this transformation in a language such as
JavaScript requires checking those assumptions again.

## Cost model

**Visiting a nonempty list cell costs one tick; visiting an empty list costs zero.**
The model excludes work inside `f` and `g`, function-call overhead, allocation,
garbage collection, and machine instructions.

`countedMap` recursively constructs the result and adds one tick per visited cell:

- `baselineCounted` runs `countedMap` twice, feeding the first result to the second pass and adding their counts.
- `optimizedCounted` runs `countedMap` once, using `g (f x)` as the callback.
- `baselineCounted_result` and `optimizedCounted_result` prove that the counted executions return the same results as their respective Lean implementations.

Costs come from an explicit execution model, with separate proofs connecting its
results to the implementations. These result proofs do not establish that the
counter describes the compiled program's complete runtime cost.

For an input of length `n`:

| Claim | Theorem |
| --- | --- |
| Two passes visit `2n` cells | `baseline_visits` |
| The fused pass visits `n` cells | `optimized_visits` |
| Fusion saves exactly `n` visits | `visits_saved` |
| Fusion never increases the visit count | `visits_no_more` |
| The count is strictly lower exactly when the list is nonempty | `visits_strict_iff` |

Both versions still apply each of `f` and `g` exactly `n` times. Fusion reduces
traversal work without reducing the number of callback applications. Both versions
remain linear in this cost model.

## Running the example

From the repository root:

```sh
lake build
lake exe demo
```

The input is `[1, 2, 3, 4, 5]`, with `f x = x + 1` and `g x = x * 2`.
Both results are `[4, 6, 8, 10, 12]`; modeled list-cell visits drop from `10` to `5`.

## Evidence and next steps

- **Proved:** Result equivalence, correspondence between counted and uncounted results, and the visit-count claims above.
- **Not yet measured:** Elapsed time, cumulative allocation, and peak memory.
- **Open experiment:** Benchmark the compiled functions, recording the Lean version, build settings, hardware, input sizes, repetitions, and how results are consumed. Check whether the compiler already performs related optimizations.

`demo` illustrates the cost model; it is not a benchmark. Its output does not
justify a claim that the optimized program runs twice as fast.
