# Local setup

You need Node 20+, npm, and an Anthropic API key. Neon and Blob are not required on your machine.

## 1. Install

```bash
npm install
```

## 2. API key

Copy `.env.example` to `.env.local` and put the key on `ANTHROPIC_API_KEY`. Leave `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` empty.

The SDK reads `ANTHROPIC_API_KEY` from the environment. `npm run dev` loads `.env.local` (and `.env` if you already have one). Do not commit either file.

Without the key the screens still open. Chat and “Analizar y guardar” return “No pude responder ahora” / “No pude analizar la foto.”

## 3. Run

```bash
npm run dev
```

- Investor: http://localhost:3000
- Chat: http://localhost:3000/chat
- Constructor upload: http://localhost:3000/cargar
- Before you invest: http://localhost:3000/antes-de-invertir

## What you should see without uploading

Seeded observations from `data/observaciones.json` (no real jpgs yet, so the camera shows schemes):

- Floors 1 and 2: cumplido
- Floor 3: cumplido con atraso (10 nov 2026; prometido 30 sep 2026)
- Fachada: cumplido (10 nov 2026)
- Día de seguimiento: 10 nov 2026, the date of the last photo

Ask one of the four suggested questions. The reply should cite a date.

## Upload (constructor)

On `/cargar`, pick a date and an image. The browser shrinks it to ~1280 px JPEG and `POST /api/analizar` runs the vision agent.

Locally that writes:

- `public/obra/AAAA-MM-DD.jpg`
- `.data/observaciones.json` (gitignored)

Reload `/`. The new date should appear on the camera and in chat. Same-day uploads replace that day’s row.

## Optional: rebuild the seed from real photos

Put 8–12 files named `AAAA-MM-DD.jpg` in `public/obra`, then:

```bash
npm run analizar
```

Check `data/observaciones.json`. If a floor count is wrong, edit it there. That file is what the demo shows before anyone uploads.

## Checks

```bash
npm test
npx tsc --noEmit
```
