import Std

namespace SameButBetter.MapFusion

/-- Version B: apply both pure functions during a single list traversal. -/
def versionB (f : α → β) (g : β → γ) (xs : List α) : List γ :=
  xs.map (fun x => g (f x))

end SameButBetter.MapFusion
