import Std

namespace SameButBetter.MapFusion

/-- Version A: apply `f`, then traverse the intermediate list to apply `g`. -/
def versionA (f : α → β) (g : β → γ) (xs : List α) : List γ :=
  (xs.map f).map g

end SameButBetter.MapFusion
