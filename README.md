# NEXORA 2026 — Starter Scaffold

This is the Day-1 skeleton described in `/docs/DevelopmentPlan.md` Step 1 — folder
structure + Firebase connection wiring, no features implemented yet. Build features
on top of this using the requirement-ID-driven prompts in `/docs/AI_Build_Guide.md`.

## Quick start

```bash
npm install
cp .env.example .env
# fill in .env with your real Firebase values (see the main setup guide)
# fill in public/js/firebase-config.js with your Firebase client config
npm run dev
```

Visit http://localhost:3000 — if the server starts with no errors, Day 1 Step 1 is done.

## Folder structure

```
config/       Firebase Admin SDK init
routes/       Express route definitions, one file per feature area
controllers/  Business logic — currently TODO stubs mapped to SRS requirement IDs
middleware/   requireAuth, requireRole, error handler
views/        EJS page templates
public/       Static CSS/JS served to the browser
firestore.rules, storage.rules   Deny-all client rules (deploy via Firebase CLI or console)
```

## Every controller stub

Every function in `controllers/` currently returns `501 Not Implemented` and has a
`TODO` comment citing the exact SRS requirement IDs and acceptance criteria it needs to
satisfy. Feed that file + the relevant SRS section to Claude Code (or your AI tool of
choice) one at a time — see the main setup guide, Day 1–3 sections.
