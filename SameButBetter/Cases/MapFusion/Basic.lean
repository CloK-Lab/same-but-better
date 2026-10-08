import Std

/-!
# Map fusion

Two list maps have the same result as one map of the composed function.
We count abstract visits to nonempty list cells, excluding the work inside
`f` and `g`. The counted executions are linked to the implementations below
by result theorems. These counts are not claims about native elapsed time,
compiler output, allocation, or peak memory.
-/

namespace SameButBetter.MapFusion

variable {α β γ : Type}

/-- Apply `f`, then traverse the intermediate list to apply `g`. -/
def baseline (f : α → β) (g : β → γ) (xs : List α) : List γ :=
  (xs.map f).map g

/-- Apply both pure functions during a single list traversal. -/
def optimized (f : α → β) (g : β → γ) (xs : List α) : List γ :=
  xs.map (fun x => g (f x))

/-- Equivalence holds for every finite list and every pair of pure functions. -/
theorem equivalent (f : α → β) (g : β → γ) (xs : List α) :
    baseline f g xs = optimized f g xs := by
  simp [baseline, optimized, List.map_map, Function.comp_def]

/-- An instrumented map: each nonempty list cell visited costs one tick. -/
def countedMap (f : α → β) : List α → List β × Nat
  | [] => ([], 0)
  | x :: xs =>
    let tail := countedMap f xs
    (f x :: tail.1, tail.2 + 1)

@[simp] theorem countedMap_result (f : α → β) (xs : List α) :
    (countedMap f xs).1 = xs.map f := by
  induction xs with
  | nil => rfl
  | cons x xs ih => simp [countedMap, ih]

@[simp] theorem countedMap_visits (f : α → β) (xs : List α) :
    (countedMap f xs).2 = xs.length := by
  induction xs with
  | nil => rfl
  | cons x xs ih => simp [countedMap, ih]

/-- Execute the two passes and add the visits made by each pass. -/
def baselineCounted (f : α → β) (g : β → γ) (xs : List α) : List γ × Nat :=
  let first := countedMap f xs
  let second := countedMap g first.1
  (second.1, first.2 + second.2)

/-- Execute the fused pass using the same counting rule. -/
def optimizedCounted (f : α → β) (g : β → γ) (xs : List α) : List γ × Nat :=
  countedMap (fun x => g (f x)) xs

theorem baselineCounted_result (f : α → β) (g : β → γ) (xs : List α) :
    (baselineCounted f g xs).1 = baseline f g xs := by
  simp [baselineCounted, baseline]

theorem optimizedCounted_result (f : α → β) (g : β → γ) (xs : List α) :
    (optimizedCounted f g xs).1 = optimized f g xs := by
  simp [optimizedCounted, optimized]

@[simp] theorem baseline_visits (f : α → β) (g : β → γ) (xs : List α) :
    (baselineCounted f g xs).2 = 2 * xs.length := by
  simp [baselineCounted, Nat.two_mul]

@[simp] theorem optimized_visits (f : α → β) (g : β → γ) (xs : List α) :
    (optimizedCounted f g xs).2 = xs.length := by
  simp [optimizedCounted]

/-- Fusion saves exactly one visit per input element in this cost model. -/
theorem visits_saved (f : α → β) (g : β → γ) (xs : List α) :
    (baselineCounted f g xs).2 = (optimizedCounted f g xs).2 + xs.length := by
  simp [Nat.two_mul]

theorem visits_no_more (f : α → β) (g : β → γ) (xs : List α) :
    (optimizedCounted f g xs).2 ≤ (baselineCounted f g xs).2 := by
  rw [baseline_visits, optimized_visits]
  omega

/-- The saving is strict exactly when there is at least one element. -/
theorem visits_strict_iff (f : α → β) (g : β → γ) (xs : List α) :
    (optimizedCounted f g xs).2 < (baselineCounted f g xs).2 ↔ xs ≠ [] := by
  cases xs with
  | nil => simp
  | cons x xs => simp

end SameButBetter.MapFusion
