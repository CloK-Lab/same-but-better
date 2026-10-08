import Std

namespace SameButBetter.MapFusion

/-- The output preserves input order and replaces each `x` with `g (f x)`. -/
inductive Specification (f : α → β) (g : β → γ) : List α → List γ → Prop
  | nil : Specification f g [] []
  | cons (x : α) (xs : List α) (ys : List γ) :
      Specification f g xs ys → Specification f g (x :: xs) (g (f x) :: ys)

/-- The specification determines a unique output for each input. -/
theorem Specification.unique {f : α → β} {g : β → γ} {xs : List α}
    {ys zs : List γ} (hy : Specification f g xs ys) (hz : Specification f g xs zs) :
    ys = zs := by
  induction hy generalizing zs with
  | nil => cases hz; rfl
  | cons x xs ys h ih =>
    cases hz with
    | cons _ _ zs hz => exact congrArg (List.cons (g (f x))) (ih hz)

end SameButBetter.MapFusion
