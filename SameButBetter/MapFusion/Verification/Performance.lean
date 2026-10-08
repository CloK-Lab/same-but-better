import SameButBetter.MapFusion.VersionA
import SameButBetter.MapFusion.VersionB

namespace SameButBetter.MapFusion

/-- Return the mapped list and the number of nonempty cells visited. -/
def countedMap (f : α → β) : List α → List β × Nat
  | [] => ([], 0)
  | x :: xs =>
    let (ys, cost) := countedMap f xs
    (f x :: ys, cost + 1)

/-- One traversal preserves the map result and visits exactly `xs.length` cells. -/
@[simp] theorem countedMap_spec (f : α → β) (xs : List α) :
    countedMap f xs = (xs.map f, xs.length) := by
  induction xs with
  | nil => rfl
  | cons x xs ih => simp [countedMap, ih]

/-- Two successive traversals, with their visit counts added. -/
def versionACounted (f : α → β) (g : β → γ) (xs : List α) : List γ × Nat :=
  let (ys, firstCost) := countedMap f xs
  let (zs, secondCost) := countedMap g ys
  (zs, firstCost + secondCost)

/-- One traversal applying the composed function. -/
def versionBCounted (f : α → β) (g : β → γ) (xs : List α) : List γ × Nat :=
  countedMap (fun x => g (f x)) xs

/-- Both counted executions return the original outputs, at costs `2n` and `n`. -/
theorem implementation_costs (f : α → β) (g : β → γ) (xs : List α) :
    versionACounted f g xs = (versionA f g xs, 2 * xs.length) ∧
    versionBCounted f g xs = (versionB f g xs, xs.length) := by
  simp [versionACounted, versionBCounted, versionA, versionB, Nat.two_mul]

end SameButBetter.MapFusion
