# ArenaNepalSport mobile app — agent notes

This is the Expo React Native client for **ArenaNepalSport / Stadium Pulse** — a sports venue booking + leagues app, Playo-inspired.

## Stack (pinned)

- **Expo SDK 54** — read the matching docs at https://docs.expo.dev/versions/v54.0.0/ before touching native or router APIs.
- **React 19.1**, **React Native 0.81.5**
- **expo-router v6** for file-based routing (routes live in `src/app/`)
- **NativeWind v4** (Tailwind for RN) — `className` for layout/spacing, theme-driven colors via `useTheme()` + `style`
- **Lucide** icons (in-app) via `lucide-react-native`; **NativeTabs** uses native SF Symbols + Android drawables
- **Zustand** for UI state, **React Hook Form + Yup** for forms, **FlashList** for large lists

## Design system

- **Design language:** *Modern Sports-Tech — premium, Apple/Playo-inspired, mobile-first:*
  soft gradient surfaces (`GradientBackground`, on by default via `Screen`), large bold typography,
  minimal UI, and a single primary CTA per screen/step. Font: **Plus Jakarta Sans** (400–800).
- Tokens live in **two synced files** — never edit one without the other:
  - [tailwind.config.js](tailwind.config.js) — for `className`
  - [src/constants/theme.ts](src/constants/theme.ts) — for StyleSheet / dynamic values (incl. `Gradients`)
- Common primitives: [src/components/common/](src/components/common/)
  - `Screen`, `GradientBackground`, `Typography`, `Button`, `Card`, `Badge`, `Input`, `SearchBar`,
    `Avatar`, `Icon`, `SectionHeader`, `StepProgress`, `PhoneInput`, `OtpInput`
  - **`FormScreen`** — shared layout for auth + onboarding (user & venue): top safe area,
    keyboard avoidance, optional scrolling body, and a sticky `footer` lifted clear of the
    keyboard and the system nav bar. Pass `header` / `footer` nodes + `scroll`. Use it for any
    header + body + pinned-CTA screen rather than re-wiring `Screen` + `KeyboardAvoidingView`.
  - **Forms (React Hook Form + Yup):** build every form with `useYupForm` ([src/lib/forms.ts](src/lib/forms.ts))
    and a Yup schema, then bind fields with the **RHF-connected components in [src/components/form/](src/components/form/)**
    (pass `control` + `name`): `FormInput`, `FormPhoneInput`, `FormTimeSelect`, `FormOtpInput`.
    They handle value/onChange/onBlur + error display. Don't wire inputs by hand with
    `watch`/`setValue` — add a `Form*` wrapper around the presentational primitive instead.
    Keep presentational primitives (`Input`, `PhoneInput`, `TimeSelect`, `OtpInput`, …) in
    [src/components/common/](src/components/common/); the `form/` folder holds only the RHF bindings.
- The app is **light-locked** (`FORCE_LIGHT` in [src/hooks/use-color-scheme.ts](src/hooks/use-color-scheme.ts));
  dark tokens remain for later. System bars via `SystemBars` (react-native-edge-to-edge).
- **Style rule (Tailwind-first):** layout & spacing go in `className` on `View`/`Text`/host
  elements — **not** `StyleSheet.create`. Use the token-backed utilities (`px-lg`, `gap-md`,
  `pb-xl`, `rounded-2xl`, `flex-1`, `items-center`, …). Reserve `style={{ ... }}` for:
  (1) theme-driven colors from `useTheme()`, (2) dynamic/runtime values (e.g. safe-area insets),
  (3) third-party components NativeWind doesn't interop (e.g. `LinearGradient` — style it with
  `StyleSheet.absoluteFill` / inline `flex: 1`). Primitives that only accept `style`
  (`Typography`) take layout via `style`; `Button`/`Card`/`Screen` accept `className`.
  Don't reach for `StyleSheet.create` just to express padding/gap/flex.

## Auth & data (frontend-only for now)

- **No backend is wired.** Auth runs entirely on-device behind a provider seam so the
  real API can be dropped in later with no screen/store changes.
  - Contract: [src/lib/auth/provider.ts](src/lib/auth/provider.ts) (`AuthProvider`, neutral `AuthSession`).
  - Active impl: **mock** ([src/lib/auth/mock-auth.ts](src/lib/auth/mock-auth.ts)) — AsyncStorage, no network.
    Any **6-digit** OTP passes; login accepts any phone + password.
  - Swap point: one line in [src/lib/auth/index.ts](src/lib/auth/index.ts) (`authProvider = …`).
  - `@supabase/supabase-js` stays in `package.json` but is **unused** (no client in the app).
- **Flow:** `welcome` (role chosen by which CTA: "Get Started as Player" / "Continue as
  owner") → `login` (role-themed; links on to register) → `signup` (name, phone, password) →
  `verify` (OTP) → owner-only `venue/basic-info` (minimal: name, location, phone, hours).
  The role is stashed as a **pending role** ([src/lib/profile.ts](src/lib/profile.ts)) and
  adopted on the first hydrate after verify. `(onboarding)/role` remains as a fallback role
  picker for an authed account with no role, built on
  [src/components/onboarding/RoleSelect.tsx](src/components/onboarding/RoleSelect.tsx).
  After verify, both roles are gated: players pick sport interests
  (`(onboarding)/player/sports`, stored as `playerOnboarded`/`playerSports`); owners go to the
  "Add your venue" landing (`(onboarding)/venue`) → a 5-step creation flow
  (`(onboarding)/venue/create`: photos/basics → location → sports & pricing → hours →
  optional verification), gated by `venueOnboarded`. The venue draft persists per step to
  AsyncStorage ([src/lib/onboarding-draft.ts](src/lib/onboarding-draft.ts)) so a restart
  resumes it. Sports live in [src/data/sports.ts](src/data/sports.ts) (`SPORTS_CATALOG`).
- **Status machine** in [src/stores/use-auth-store.ts](src/stores/use-auth-store.ts):
  `loading → signedOut → onboarding → authed`. Route groups are guarded by status in
  [src/app/_layout.tsx](src/app/_layout.tsx): `(public)` / `(onboarding)` / `(player)` / `(venue)`.
- **Local stubs** (swap for the API later): role + onboarding progress in
  [src/lib/profile.ts](src/lib/profile.ts); venue submit is a no-op in [src/lib/venues.ts](src/lib/venues.ts).
- **Location** uses a pin-drop map (dev build) or GPS + manual address (Expo Go)
  ([src/components/venue/LocationPicker.tsx](src/components/venue/LocationPicker.tsx)), plus a
  **Google Places search** box ([src/lib/places.ts](src/lib/places.ts),
  [PlacesSearch.tsx](src/components/venue/PlacesSearch.tsx)) — requires the **Places API**
  enabled on `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`; it degrades gracefully (hidden) if absent.

## Conventions

- Strict TypeScript. No `any`.
- Named exports for components; default exports only when expo-router requires them.
- Data-driven UI — repeated rows go in an array + `.map()`, not duplicated JSX.
- `as const` for static config arrays so literal types are preserved.
- Import order: side-effect / external / `@/` / relative — enforced by ESLint.
- Tooling: `npm run lint`, `npm run format`, `npm run typecheck`.
