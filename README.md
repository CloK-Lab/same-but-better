# same-but-better

Exploring equivalent implementations and performance trade-offs through small examples, Lean proofs, and benchmarks.

The same problem can have many implementations. We study when they behave the
same, how their costs differ, and which assumptions make those conclusions hold.

Each case brings code, explanation, proofs, and experiments together. Topics can
include algorithms, data processing, and frontend interactions. Start with one
clear example and grow the collection gradually.

## Getting started

Install [elan, the Lean toolchain manager](https://github.com/leanprover/elan#installation), then run:

```sh
git clone https://github.com/CloK-Lab/same-but-better.git
cd same-but-better
lake build
lake exe demo
```

The project pins **Lean 4.34.0** and currently uses only the Lean standard library.
`lake build` compiles the implementations, checks the proofs, and builds the demo.
To explore proofs interactively, open this directory in VS Code with the Lean 4 extension.

## Cases

| Case | Equivalence | Cost result | Runtime measurements |
| --- | --- | --- | --- |
| [Map fusion: two traversals into one](examples/map-fusion/README.md) | Proved for all finite lists and pure functions | Proved: abstract list-cell visits drop from `2n` to `n` | Not yet measured; `demo` only displays modeled counts |

“Better” depends on the metric and the assumptions. One implementation may run
faster while another uses less memory. Some improvements only pay off at certain
input sizes. Each case should explain these trade-offs.

## Reading a case

1. Read the problem and compare the implementations.
2. Check the scope of equivalence: which behavior is compared, and under what assumptions?
3. Follow the Lean proof and the connection between the model and the implementation.
4. Inspect the cost model: what does it count, and what does it leave out?
5. If benchmarks are available, check the commands, inputs, environment, and raw results.

We distinguish **proved claims, measured observations, and open questions**.
A proof about operation counts is not a proof about elapsed time on real hardware.
Equivalence between two Lean models also does not automatically establish
equivalence between programs written in another language.

## Structure

```text
SameButBetter/
  Cases/MapFusion/Basic.lean   # Implementations, counted executions, and proofs
SameButBetter.lean            # Case library entry point
Main.lean                     # Runnable cost-model demo
examples/map-fusion/README.md # Case explanation
CONTRIBUTING.md               # How to add a case
```

## Contributing

A small example, a clearer explanation, a proof, a counterexample, or a reproducible
performance experiment is a useful contribution. A case does not need to cover
every dimension at once. See [CONTRIBUTING.md](CONTRIBUTING.md).
