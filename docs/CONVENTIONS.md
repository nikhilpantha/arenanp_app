# Frontend conventions

Two rules to follow on every change.

## 1. Keep files small — under ~200 lines

No single file should grow past ~200 lines. When a screen gets big, split it:

- **Screen** (`src/app/.../x.tsx`) — thin: layout + wiring only.
- **Hook** (`use-x.ts`) — data fetching, derived values, form, submit handler.
- **Presentational components** (`x-fields.tsx`, `XCard.tsx`, …) — dumb UI, props in / events out.

Repeated UI is data-driven: an array + `.map()`, never copy-pasted JSX.

Example split: [membership/book.tsx](../src/app/(venue-booking)/membership/book.tsx) (screen)
→ [use-book-subscription.ts](../src/components/venue/bookings/subscribe/use-book-subscription.ts) (logic)
→ [subscribe-fields.tsx](../src/components/venue/bookings/subscribe/subscribe-fields.tsx) (UI).

## 2. Forms use React Hook Form + Yup, with inline errors

Every form — including **selection** forms (pick a plan / court / slot), not just text inputs — uses
`useYupForm` ([src/lib/forms.ts](../src/lib/forms.ts)) + a Yup schema.

- Bind text inputs with the `Form*` components in [src/components/form/](../src/components/form/).
- For custom pickers (cards, chips, date strips), drive the field with `form.setValue(name, value, { shouldValidate: true })` and read it with `form.watch()`.
- Show validation errors **inline, directly under the field** (a small danger-coloured line). Never put field-validation errors in a toast.
- **Toasts are for success and server / network errors only** — not for "you forgot to pick X".
- Let the submit button stay enabled; `form.handleSubmit` runs validation and populates the inline errors. Don't gate the button on a hand-rolled `ready` flag for required-field checks.
