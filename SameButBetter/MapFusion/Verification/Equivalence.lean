import SameButBetter.MapFusion.VersionA
import SameButBetter.MapFusion.VersionB
import SameButBetter.MapFusion.Verification.Specification

namespace SameButBetter.MapFusion

/-- The two-pass implementation satisfies the output specification. -/
theorem versionA_correct (f : α → β) (g : β → γ) (xs : List α) :
    Specification f g xs (versionA f g xs) := by
  induction xs with
  | nil => exact .nil
  | cons x xs ih =>
    simpa only [versionA, List.map_cons] using
      Specification.cons x xs (versionA f g xs) ih

/-- The fused implementation satisfies the same output specification. -/
theorem versionB_correct (f : α → β) (g : β → γ) (xs : List α) :
    Specification f g xs (versionB f g xs) := by
  induction xs with
  | nil => exact .nil
  | cons x xs ih =>
    simpa only [versionB, List.map_cons] using
      Specification.cons x xs (versionB f g xs) ih

/-- Versions A and B return the same list for all finite lists and pure functions. -/
theorem versionA_eq_versionB (f : α → β) (g : β → γ) (xs : List α) :
    versionA f g xs = versionB f g xs := by
  exact Specification.unique (versionA_correct f g xs) (versionB_correct f g xs)

end SameButBetter.MapFusion
