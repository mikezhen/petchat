# PawCode Security & Cost Controls

This document tracks the production security posture: what's enforced in code,
and the operational (console/GCP) actions that can't live in the repo.

---

## Enforced in code (this repo)

| Control | Where |
|---|---|
| Scan events rate-limited to ~1–2/pet/minute via time-bucket doc IDs + `exists(pet)` | `firestore.rules`, `src/app/pet/FinderView.tsx` |
| Per-field size caps on pet & user documents | `firestore.rules` |
| Owner-scoped pet photo path `pets/{petId}/{ownerUid}/photo.jpg` | `storage.rules`, `src/lib/pets.ts`, `src/components/PetForm.tsx` |
| Pet photo deleted from Storage when a pet is deleted | `src/lib/pets.ts` (`deletePet`) |
| Cloud Function concurrency cap (`maxInstances: 10`) | `functions/src/index.ts` |
| Magic-link send cooldown (client-side) | `src/lib/useSendCooldown.ts` |
| Image upload size/type limits (10 MB, `image/*`) | `storage.rules` |
| Auth: magic link for new users, password for existing, unregistered users blocked | `src/lib/doSignIn.ts` |

---

## Operational follow-ups (console / GCP — not in the repo)

These are the highest-leverage remaining controls. They require access to the
Firebase console / Google Cloud and can't be committed as code.

### 1. Firebase App Check — **keystone control** (highest priority)

Ensures requests to Firestore, Storage, and Cloud Functions come from the real
PawCode app, not scripts/curl. This is what hardens the *public* surfaces (the
finder page reads pets and writes scan events without login).

- **Provider:** reCAPTCHA Enterprise (web).
- **Steps:** Firebase console → App Check → register the web app → add the
  App Check SDK init to the client → enable enforcement per product.
- **Rollout:** start in **monitor mode** (logs unverified requests without
  blocking), confirm legitimate traffic passes, then **enforce**.
- Use **debug tokens** for local development and CI.
- Also enable **App Check for Authentication** to harden magic-link sending
  (the real control behind the client-side cooldown).

### 2. Cloud Billing budget + alerts

Turns a silent cost spike into a same-day email.

- GCP console → Billing → Budgets & alerts → create a monthly budget with
  alert thresholds (e.g., 50% / 90% / 100%).
- Note: a budget alerts but does not cap spend; the code-level limits above are
  what actually bound cost.

### 3. Firebase Authentication abuse protections

- Enable **email enumeration protection** (console → Authentication → Settings).
- Confirm App Check for Auth (see #1) is enforced for email-link sign-in.

### 4. Storage lifecycle backstop (optional)

`deletePet` removes a pet's photo on deletion, so new orphans aren't created.
Two legacy edges remain (pre–owner-scoped-path data): re-uploading over a pet
created before the path change leaves one old file, and deleting such a pet
leaves its old-path photo. To mop these up, run a one-time audit or a scheduled
Cloud Function that deletes Storage objects not referenced by any pet's
`photoUrl`. (A blanket time-based GCS lifecycle rule is unsafe — it would delete
active photos.)

---

## Known follow-ups before re-enabling features

- **Email-on-scan alerts (currently disabled):** the email template in
  `functions/src/index.ts` interpolates `pet.name` / `owner.fullName` into raw
  HTML. Escape these values before re-enabling to prevent HTML/email injection.
  When re-enabled, the function also benefits from the scan-event rate limit
  already in place (fewer triggers) plus the `maxInstances` cap.

---

## Data-exposure note

Pet documents are **publicly readable** (`pets/{petId}: allow read: if true`) —
this is required for the finder page to work without login. The public payload
includes the owner's contact info by design. Pet IDs are unguessable random
Firestore IDs, which makes enumeration impractical; App Check (#1) further
restricts reads to the real app. If finer privacy is needed later, split the
sensitive fields out of the publicly-read document.
