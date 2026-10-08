import SameButBetter

open SameButBetter.MapFusion

/-- A small executable illustration of the proved cost model, not a benchmark. -/
def main : IO Unit := do
  let xs := [1, 2, 3, 4, 5]
  let f := fun x : Nat => x + 1
  let g := fun x : Nat => x * 2
  let before := baselineCounted f g xs
  let after := optimizedCounted f g xs
  IO.println "Map fusion: two traversals -> one"
  IO.println s!"Input: {xs}"
  IO.println s!"Baseline result: {baseline f g xs}"
  IO.println s!"Optimized result: {optimized f g xs}"
  IO.println s!"Abstract list-cell visits: {before.2} -> {after.2}"
  IO.println "These are modeled operation counts, not measured execution times."
